use serde::Serialize;
use serde_json::{json, Map, Value};
use std::env;
use std::fs;
use std::io;
use std::path::{Path, PathBuf};
use std::process::{Command, Output, Stdio};

#[derive(Serialize)]
struct Health {
    ok: bool,
}

#[derive(Clone)]
struct RepoInfo {
    id: String,
    name: String,
    slug: String,
    url: String,
    clone_url: String,
}

#[derive(Clone)]
struct GroupData {
    id: String,
    name: String,
    kind: String,
    url: Option<String>,
    path: Option<PathBuf>,
    imported_at: Option<String>,
    updated_at: Option<String>,
}

#[derive(Clone)]
struct SkillSource {
    relative_path: String,
    content: String,
    manifest_content: Option<String>,
    related_files: Vec<Value>,
    absolute_path: Option<PathBuf>,
}

#[derive(Clone)]
struct InstallTargetData {
    id: String,
    tool_id: String,
    label: String,
    skills_dir: PathBuf,
    slash_commands_dir: Option<PathBuf>,
}

#[derive(Clone)]
struct ResolvedSkillSource {
    skill_id: String,
    source_dir: PathBuf,
    install_name: String,
    relative_path: String,
    category: String,
    summary: String,
}

#[tauri::command]
fn health() -> Health {
    Health { ok: true }
}

#[tauri::command]
fn list_library() -> Result<Value, String> {
    build_library()
}

#[tauri::command]
fn import_repository(input: Value) -> Result<Value, String> {
    let url = get_string(&input, "url")?;
    let repo = normalize_github_url(&url)?;
    clone_or_pull(&repo)?;
    let repo_path = repos_dir().join(&repo.slug);
    if read_skill_sources(&repo_path)?.is_empty() {
        return Err("This repository does not contain a detectable skills directory or SKILL.md files.".to_string());
    }

    let now = now_iso();
    let mut library = load_library()?;
    let existing_repos = library
        .get("repositories")
        .and_then(Value::as_array)
        .cloned()
        .unwrap_or_default();
    let existing = existing_repos
        .iter()
        .find(|item| item.get("id").and_then(Value::as_str) == Some(repo.id.as_str()));
    let imported_at = existing
        .and_then(|item| {
            string_field(item, "importedAt").or_else(|| string_field(item, "imported_at"))
        })
        .unwrap_or_else(|| now.clone());

    let mut repositories: Vec<Value> = existing_repos
        .into_iter()
        .filter(|item| item.get("id").and_then(Value::as_str) != Some(repo.id.as_str()))
        .collect();
    repositories.push(json!({
        "id": repo.id,
        "name": repo.name,
        "url": repo.url,
        "clone_url": repo.clone_url,
        "slug": repo.slug,
        "source": "desktop-local",
        "path": repo_path,
        "importedAt": imported_at,
        "updatedAt": now,
        "imported_at": imported_at,
        "updated_at": now
    }));
    repositories
        .sort_by(|left, right| value_string(left, "name").cmp(&value_string(right, "name")));
    library["version"] = json!(1);
    library["repositories"] = Value::Array(repositories);
    save_library(&library)?;
    build_library()
}

#[tauri::command]
fn refresh_repositories() -> Result<Value, String> {
    let mut library = load_library()?;
    let mut repositories = library
        .get("repositories")
        .and_then(Value::as_array)
        .cloned()
        .unwrap_or_default();
    let now = now_iso();

    for repository in &mut repositories {
        let stored = stored_repo(repository)?;
        if stored.path.join(".git").exists() {
            run_git(&["pull", "--ff-only"], Some(&stored.path))?;
        }
        repository["updatedAt"] = json!(now);
        repository["updated_at"] = json!(now);
    }

    library["repositories"] = Value::Array(repositories);
    save_library(&library)?;
    build_library()
}

#[tauri::command]
fn remove_repository(input: Value) -> Result<Value, String> {
    let repository_id = get_string(&input, "repositoryId")?;
    if repository_id == "local:workspace" {
        return Err("The local workspace group cannot be removed.".to_string());
    }

    let mut library = load_library()?;
    let repositories = library
        .get("repositories")
        .and_then(Value::as_array)
        .cloned()
        .unwrap_or_default();
    let mut kept = Vec::new();
    let mut removed = None;
    for repository in repositories {
        if repository.get("id").and_then(Value::as_str) == Some(repository_id.as_str()) {
            removed = Some(repository);
        } else {
            kept.push(repository);
        }
    }
    let removed = removed.ok_or_else(|| "Repository not found.".to_string())?;
    if let Ok(stored) = stored_repo(&removed) {
        if is_path_inside(&stored.path, &repos_dir()) && stored.path.exists() {
            fs::remove_dir_all(&stored.path).map_err(|error| {
                format!(
                    "Failed to remove repository cache {}: {error}",
                    stored.path.display()
                )
            })?;
        }
    }
    library["repositories"] = Value::Array(kept);
    save_library(&library)?;
    build_library()
}

#[tauri::command]
fn get_skill_detail(input: Value) -> Result<Value, String> {
    let skill_id = get_string(&input, "skillId")?;
    find_skill_detail(&skill_id)
}

#[tauri::command]
fn list_translation_providers() -> Value {
    json!([
        {
            "id": "openai",
            "label": "OpenAI",
            "configured": openai_api_key().ok().flatten().is_some(),
            "supportsConfiguration": true,
            "configurationHint": "Use OPENAI_API_KEY or save an OpenAI key here."
        },
        {
            "id": "openrouter",
            "label": "OpenRouter",
            "configured": openrouter_api_key().ok().flatten().is_some(),
            "supportsConfiguration": true,
            "configurationHint": "Use OPENROUTER_API_KEY or save an OpenRouter key here."
        },
        {
            "id": "codex",
            "label": "Local Codex",
            "configured": command_available("codex"),
            "configurationHint": "Uses local `codex exec` in read-only, ephemeral mode."
        },
        {
            "id": "claude-code",
            "label": "Local Claude Code",
            "configured": command_available("claude"),
            "configurationHint": "Uses local `claude -p` with no session persistence."
        }
    ])
}

#[tauri::command]
fn save_translation_provider_config(input: Value) -> Result<Value, String> {
    let provider_id = get_string(&input, "providerId")?;
    let provider_key = configurable_translation_provider_key(&provider_id)?;

    let mut root = load_config()?.as_object().cloned().unwrap_or_default();
    let mut translation = root
        .remove("translation")
        .and_then(|value| value.as_object().cloned())
        .unwrap_or_default();
    let mut provider = translation
        .remove(provider_key)
        .and_then(|value| value.as_object().cloned())
        .unwrap_or_default();

    if let Some(api_key) = string_field(&input, "apiKey") {
        let trimmed = api_key.trim();
        if trimmed.is_empty() {
            provider.remove("apiKey");
        } else {
            provider.insert("apiKey".to_string(), json!(trimmed));
        }
    }
    if let Some(model) = string_field(&input, "model") {
        let trimmed = model.trim();
        if trimmed.is_empty() {
            provider.remove("model");
        } else {
            provider.insert("model".to_string(), json!(trimmed));
        }
    }

    translation.insert(provider_key.to_string(), Value::Object(provider));
    root.insert("translation".to_string(), Value::Object(translation));
    save_config(&Value::Object(root))?;
    Ok(list_translation_providers())
}

#[tauri::command]
fn translate_skill(input: Value) -> Result<Value, String> {
    let skill_id = required_trimmed_string(&input, "skillId", "Missing skill id.")?;
    let target_language =
        required_trimmed_string(&input, "targetLanguage", "Missing target language.")?;
    let provider_id = string_field(&input, "providerId").unwrap_or_else(|| "openai".to_string());
    let provider_id = provider_id.trim();
    let detail = find_skill_detail(&skill_id)?;
    let source_mode = string_field(&input, "sourceMode").unwrap_or_else(|| "markdown".to_string());
    let markdown = translation_source_markdown(&detail, source_mode.trim())?;

    match provider_id {
        "" | "openai" => translate_with_openai(&skill_id, &target_language, &markdown),
        "openrouter" => translate_with_openrouter(&skill_id, &target_language, &markdown),
        "codex" | "claude-code" => {
            translate_with_local_agent(provider_id, &skill_id, &target_language, &markdown)
        }
        _ => Err(format!("Unsupported translation provider: {provider_id}")),
    }
}

#[tauri::command]
fn list_install_targets() -> Value {
    Value::Array(install_targets().into_iter().map(target_to_value).collect())
}

#[tauri::command]
fn get_install_status(input: Value) -> Result<Value, String> {
    let skill_ids = get_string_array(&input, "skillIds")?;
    let targets = install_targets();
    let mut items = Vec::new();
    for skill_id in skill_ids {
        let source = resolve_skill_source(&skill_id)?;
        for target in &targets {
            let destination = target.skills_dir.join(&source.install_name);
            let destination_exists = destination.exists();
            let managed = destination_exists && has_manifest_entry(target, &source);
            items.push(json!({
                "skillId": source.skill_id,
                "targetId": target.id,
                "installed": managed,
                "conflict": destination_exists && !managed,
                "destinationPath": destination
            }));
        }
    }
    Ok(Value::Array(items))
}

#[tauri::command]
fn install_skills(input: Value) -> Result<Value, String> {
    let skill_ids = get_string_array(&input, "skillIds")?;
    let target_ids = get_string_array(&input, "targetIds")?;
    let mode = string_field(&input, "mode").unwrap_or_else(|| "copy".to_string());
    validate_install_mode(&mode)?;
    let conflict_policy =
        string_field(&input, "conflictPolicy").unwrap_or_else(|| "fail".to_string());
    validate_install_conflict_policy(&conflict_policy)?;
    let with_slash_commands = bool_field(&input, "withSlashCommands").unwrap_or(false);
    let targets = selected_install_targets(&target_ids)?;
    let mut items = Vec::new();

    for skill_id in skill_ids {
        let source = resolve_skill_source(&skill_id)?;
        for target in &targets {
            fs::create_dir_all(&target.skills_dir).map_err(|error| {
                format!("Failed to create {}: {error}", target.skills_dir.display())
            })?;
            let destination = target.skills_dir.join(&source.install_name);
            if destination.exists() && conflict_policy == "fail" {
                items.push(install_item(
                    &source,
                    target,
                    &destination,
                    "conflict",
                    Some("Destination already exists."),
                ));
                continue;
            }
            if destination.exists() && conflict_policy == "skip" {
                items.push(install_item(
                    &source,
                    target,
                    &destination,
                    "skipped",
                    Some("Destination already exists."),
                ));
                continue;
            }
            if destination.exists() && conflict_policy == "overwrite" {
                remove_existing(&destination).map_err(|error| {
                    format!("Failed to remove {}: {error}", destination.display())
                })?;
            }

            if mode == "symlink" {
                create_dir_symlink(&source.source_dir, &destination)?;
            } else {
                copy_dir_all(&source.source_dir, &destination).map_err(|error| {
                    format!(
                        "Failed to copy {} to {}: {error}",
                        source.source_dir.display(),
                        destination.display()
                    )
                })?;
            }
            if with_slash_commands {
                install_slash_command(&source, target, conflict_policy == "overwrite")?;
            }
            upsert_manifest(target, &source, &mode)?;
            items.push(install_item(
                &source,
                target,
                &destination,
                "installed",
                None,
            ));
        }
    }

    Ok(json!({ "items": items }))
}

fn validate_install_mode(mode: &str) -> Result<(), String> {
    if mode == "copy" || mode == "symlink" {
        return Ok(());
    }
    Err(format!("Unsupported install mode: {mode}"))
}

fn validate_install_conflict_policy(policy: &str) -> Result<(), String> {
    if policy == "fail" || policy == "skip" || policy == "overwrite" {
        return Ok(());
    }
    Err(format!("Unsupported install conflict policy: {policy}"))
}

fn selected_install_targets(target_ids: &[String]) -> Result<Vec<InstallTargetData>, String> {
    let targets = install_targets();
    let unknown = target_ids
        .iter()
        .filter(|target_id| !targets.iter().any(|target| &target.id == *target_id))
        .cloned()
        .collect::<Vec<_>>();
    if !unknown.is_empty() {
        return Err(format!("Unknown install target id: {}", unknown.join(", ")));
    }
    Ok(targets
        .into_iter()
        .filter(|target| target_ids.contains(&target.id))
        .collect())
}

#[tauri::command]
fn uninstall_skills(input: Value) -> Result<Value, String> {
    let skill_ids = get_string_array(&input, "skillIds")?;
    let target_ids = get_string_array(&input, "targetIds")?;
    let with_slash_commands = bool_field(&input, "withSlashCommands").unwrap_or(false);
    let targets = selected_install_targets(&target_ids)?;
    let mut items = Vec::new();

    for skill_id in skill_ids {
        let source = resolve_skill_source(&skill_id)?;
        for target in &targets {
            let destination = target.skills_dir.join(&source.install_name);
            if with_slash_commands {
                remove_slash_command(&source, target)?;
            }
            if !destination.exists() {
                remove_manifest_entry(target, &source)?;
                items.push(install_item(
                    &source,
                    target,
                    &destination,
                    "missing",
                    Some("Destination does not exist."),
                ));
                continue;
            }
            if !has_manifest_entry(target, &source) {
                items.push(install_item(
                    &source,
                    target,
                    &destination,
                    "skipped",
                    Some("Destination exists but is not managed by Skills Manager."),
                ));
                continue;
            }
            remove_existing(&destination)
                .map_err(|error| format!("Failed to remove {}: {error}", destination.display()))?;
            remove_manifest_entry(target, &source)?;
            items.push(install_item(
                &source,
                target,
                &destination,
                "uninstalled",
                None,
            ));
        }
    }

    Ok(json!({ "items": items }))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            health,
            list_library,
            import_repository,
            refresh_repositories,
            remove_repository,
            get_skill_detail,
            list_translation_providers,
            save_translation_provider_config,
            translate_skill,
            list_install_targets,
            get_install_status,
            install_skills,
            uninstall_skills
        ])
        .run(tauri::generate_context!())
        .expect("error while running Skills Manager");
}

fn build_library() -> Result<Value, String> {
    let mut groups = Vec::new();
    let mut skills = Vec::new();
    let mut group_sources = collect_group_sources()?;

    for (group, sources) in &mut group_sources {
        sources.sort_by(|left, right| left.relative_path.cmp(&right.relative_path));
        let mut group_value = group_to_value(group);
        group_value["skillCount"] = json!(sources.len());
        groups.push(group_value);

        for source in sources {
            let detail = parse_skill_file(group, source)?;
            skills.push(to_summary(detail));
        }
    }

    skills.sort_by(|left, right| {
        value_string(left, "title")
            .cmp(&value_string(right, "title"))
            .then(value_string(left, "groupName").cmp(&value_string(right, "groupName")))
    });
    Ok(json!({ "groups": groups, "skills": skills }))
}

fn find_skill_detail(skill_id: &str) -> Result<Value, String> {
    let (group_id, relative_path) = decode_skill_id(skill_id)?;
    for (group, sources) in collect_group_sources()? {
        if group.id != group_id {
            continue;
        }
        if let Some(source) = sources
            .into_iter()
            .find(|source| source.relative_path == relative_path)
        {
            return parse_skill_file(&group, &source);
        }
    }
    Err("Skill not found.".to_string())
}

fn resolve_skill_source(skill_id: &str) -> Result<ResolvedSkillSource, String> {
    let (group_id, relative_path) = decode_skill_id(skill_id)?;
    for (group, sources) in collect_group_sources()? {
        if group.id != group_id {
            continue;
        }
        if let Some(source) = sources
            .into_iter()
            .find(|source| source.relative_path == relative_path)
        {
            let detail = parse_skill_file(&group, &source)?;
            let skill_file = source
                .absolute_path
                .clone()
                .ok_or_else(|| "Skill source is not backed by a local file.".to_string())?;
            let source_dir = skill_file
                .parent()
                .ok_or_else(|| "Skill source directory is unavailable.".to_string())?
                .to_path_buf();
            let fallback_name = source_dir
                .file_name()
                .and_then(|value| value.to_str())
                .unwrap_or("skill");
            let install_name = sanitize_install_name(
                detail
                    .get("name")
                    .and_then(Value::as_str)
                    .unwrap_or(fallback_name),
            );
            return Ok(ResolvedSkillSource {
                skill_id: skill_id.to_string(),
                source_dir,
                install_name,
                relative_path: source.relative_path,
                category: detail
                    .get("category")
                    .and_then(Value::as_str)
                    .unwrap_or_default()
                    .to_string(),
                summary: detail
                    .get("description")
                    .and_then(Value::as_str)
                    .unwrap_or_default()
                    .to_string(),
            });
        }
    }
    Err("Skill not found.".to_string())
}

fn collect_group_sources() -> Result<Vec<(GroupData, Vec<SkillSource>)>, String> {
    let root = repo_root();
    let mut result = Vec::new();
    let local_root = root.join("skills");
    let local_group = GroupData {
        id: "local:workspace".to_string(),
        name: "Local workspace".to_string(),
        kind: "local".to_string(),
        url: None,
        path: Some(local_root.clone()),
        imported_at: None,
        updated_at: None,
    };
    result.push((local_group, read_skill_sources(&local_root)?));

    let library = load_library()?;
    for repository in library
        .get("repositories")
        .and_then(Value::as_array)
        .cloned()
        .unwrap_or_default()
    {
        let stored = stored_repo(&repository)?;
        let kind = if stored.info.id.starts_with("gitlab:") {
            "gitlab".to_string()
        } else {
            "github".to_string()
        };
        let group = GroupData {
            id: stored.info.id,
            name: stored.info.name,
            kind,
            url: Some(stored.info.url),
            path: Some(stored.path.clone()),
            imported_at: stored.imported_at,
            updated_at: stored.updated_at,
        };
        result.push((group, read_skill_sources(&stored.path)?));
    }

    Ok(result)
}

struct StoredRepo {
    info: RepoInfo,
    path: PathBuf,
    imported_at: Option<String>,
    updated_at: Option<String>,
}

fn stored_repo(repository: &Value) -> Result<StoredRepo, String> {
    let url = get_string(repository, "url")?;
    let info = normalize_github_url(&url)?;
    let path = string_field(repository, "path")
        .map(PathBuf::from)
        .unwrap_or_else(|| repos_dir().join(&info.slug));
    Ok(StoredRepo {
        info,
        path,
        imported_at: string_field(repository, "importedAt")
            .or_else(|| string_field(repository, "imported_at")),
        updated_at: string_field(repository, "updatedAt")
            .or_else(|| string_field(repository, "updated_at")),
    })
}

fn read_skill_sources(root: &Path) -> Result<Vec<SkillSource>, String> {
    let mut sources = Vec::new();
    let scan_root = skill_scan_root(root)?;
    walk(&scan_root, &scan_root, &mut sources)?;
    Ok(sources)
}

fn walk(root: &Path, directory: &Path, sources: &mut Vec<SkillSource>) -> Result<(), String> {
    let entries = match fs::read_dir(directory) {
        Ok(entries) => entries,
        Err(_) => return Ok(()),
    };
    for entry in entries {
        let entry = entry.map_err(|error| error.to_string())?;
        let path = entry.path();
        let file_name = entry.file_name();
        let file_name = file_name.to_string_lossy();
        if file_name.starts_with('.') || should_skip_dir(&file_name) {
            continue;
        }
        if path.is_dir() {
            walk(root, &path, sources)?;
        } else if file_name == "SKILL.md" {
            let relative_path = path
                .strip_prefix(root)
                .map_err(|error| error.to_string())?
                .to_string_lossy()
                .replace('\\', "/");
            let manifest_path = path.with_file_name("skill.yaml");
            let skill_dir = path
                .parent()
                .ok_or_else(|| "Skill source directory is unavailable.".to_string())?;
            sources.push(SkillSource {
                relative_path,
                content: fs::read_to_string(&path)
                    .map_err(|error| format!("Failed to read {}: {error}", path.display()))?,
                manifest_content: fs::read_to_string(manifest_path).ok(),
                related_files: read_related_files(skill_dir, root)?,
                absolute_path: Some(path),
            });
        }
    }
    Ok(())
}

fn skill_scan_root(root: &Path) -> Result<PathBuf, String> {
    let skills_root = root.join("skills");
    if has_skill_files(&skills_root)? || !has_skill_files(root)? {
        Ok(skills_root)
    } else {
        Ok(root.to_path_buf())
    }
}

fn has_skill_files(root: &Path) -> Result<bool, String> {
    let mut found = false;
    walk_files(root, &mut |path| {
        if path.file_name().and_then(|value| value.to_str()) == Some("SKILL.md") {
            found = true;
        }
        Ok(())
    })?;
    Ok(found)
}

fn read_related_files(skill_dir: &Path, scan_root: &Path) -> Result<Vec<Value>, String> {
    let mut files = Vec::new();
    walk_files(skill_dir, &mut |path| {
        let file_name = path.file_name().and_then(|value| value.to_str()).unwrap_or_default();
        if file_name == "SKILL.md" || file_name == "skill.yaml" {
            return Ok(());
        }
        let metadata = fs::metadata(path).map_err(|error| error.to_string())?;
        let relative_path = path
            .strip_prefix(scan_root)
            .map_err(|error| error.to_string())?
            .to_string_lossy()
            .replace('\\', "/");
        let kind = related_file_kind(&relative_path);
        let content = if kind != "asset" && metadata.len() <= 128_000 {
            fs::read_to_string(path).ok()
        } else {
            None
        };
        files.push(json!({
            "relativePath": relative_path,
            "kind": kind,
            "sizeBytes": metadata.len(),
            "content": content
        }));
        Ok(())
    })?;
    files.sort_by(|left, right| value_string(left, "relativePath").cmp(&value_string(right, "relativePath")));
    Ok(files)
}

fn walk_files(directory: &Path, on_file: &mut dyn FnMut(&Path) -> Result<(), String>) -> Result<(), String> {
    let entries = match fs::read_dir(directory) {
        Ok(entries) => entries,
        Err(_) => return Ok(()),
    };
    for entry in entries {
        let entry = entry.map_err(|error| error.to_string())?;
        let path = entry.path();
        let file_name = entry.file_name();
        let file_name = file_name.to_string_lossy();
        if file_name.starts_with('.') || should_skip_dir(&file_name) {
            continue;
        }
        if path.is_dir() {
            walk_files(&path, on_file)?;
        } else {
            on_file(&path)?;
        }
    }
    Ok(())
}

fn related_file_kind(path: &str) -> &'static str {
    let normalized = path.to_ascii_lowercase();
    if normalized.contains("/references/") || normalized.ends_with("/references.md") {
        "reference"
    } else if matches_extension(&normalized, &["md", "mdx", "txt"]) {
        "markdown"
    } else if matches_extension(
        &normalized,
        &[
            "ts", "tsx", "js", "jsx", "mjs", "cjs", "py", "rs", "go", "java", "rb", "sh",
            "zsh", "bash", "fish", "sql", "css", "scss", "html", "jsonc",
        ],
    ) {
        "code"
    } else if matches_extension(&normalized, &["yaml", "yml", "json", "toml", "ini", "env", "lock"]) {
        "config"
    } else if matches_extension(&normalized, &["png", "jpg", "jpeg", "gif", "webp", "svg", "pdf"]) {
        "asset"
    } else {
        "other"
    }
}

fn matches_extension(path: &str, extensions: &[&str]) -> bool {
    extensions.iter().any(|extension| path.ends_with(&format!(".{extension}")))
}

fn parse_skill_file(group: &GroupData, source: &SkillSource) -> Result<Value, String> {
    let (frontmatter, body) = split_frontmatter(&source.content);
    let manifest = source
        .manifest_content
        .as_ref()
        .map(|content| parse_simple_yaml(content))
        .unwrap_or_default();
    let title = compact_description(
        first_non_empty(&[
            map_get(&manifest, "title"),
            map_get(&frontmatter, "title"),
            Some(first_heading(&body)),
            map_get(&frontmatter, "name"),
            map_get(&manifest, "id"),
            parent_dir_name(&source.relative_path),
        ])
        .unwrap_or_else(|| "Untitled Skill".to_string()),
    );
    let name = compact_description(
        map_get(&frontmatter, "name")
            .or_else(|| map_get(&manifest, "id"))
            .unwrap_or_else(|| title.clone()),
    );
    let description = compact_description(
        map_get(&frontmatter, "description")
            .or_else(|| map_get(&manifest, "summary"))
            .unwrap_or_else(|| first_paragraph(&source.content)),
    );
    let relative_dir = source
        .relative_path
        .rsplit_once('/')
        .map(|(dir, _)| dir.replace('/', "."))
        .unwrap_or_default();

    Ok(json!({
        "id": encode_skill_id(&group.id, &source.relative_path),
        "name": name,
        "title": title,
        "description": description,
        "category": category_for(&source.relative_path),
        "relativePath": source.relative_path,
        "relativeDir": relative_dir,
        "groupId": group.id,
        "groupName": group.name,
        "groupKind": group.kind,
        "content": source.content,
        "frontmatter": frontmatter,
        "manifest": manifest,
        "relatedFiles": source.related_files,
        "absolutePath": source.absolute_path
    }))
}

fn to_summary(mut detail: Value) -> Value {
    if let Some(object) = detail.as_object_mut() {
        object.remove("content");
        object.remove("frontmatter");
        object.remove("manifest");
        object.remove("relatedFiles");
        object.remove("absolutePath");
    }
    detail
}

fn split_frontmatter(markdown: &str) -> (Map<String, Value>, String) {
    if !markdown.starts_with("---") {
        return (Map::new(), markdown.to_string());
    }
    let lines: Vec<&str> = markdown.lines().collect();
    if lines.first().map(|line| line.trim()) != Some("---") {
        return (Map::new(), markdown.to_string());
    }
    let Some(end_index) = lines
        .iter()
        .enumerate()
        .skip(1)
        .find_map(|(index, line)| (line.trim() == "---").then_some(index))
    else {
        return (Map::new(), markdown.to_string());
    };
    let frontmatter = parse_simple_yaml(&lines[1..end_index].join("\n"));
    let body = lines[end_index + 1..]
        .join("\n")
        .trim_start_matches('\n')
        .to_string();
    (frontmatter, body)
}

fn parse_simple_yaml(text: &str) -> Map<String, Value> {
    let mut values = Map::new();
    for line in text.lines() {
        let stripped = line.trim();
        if stripped.is_empty() || stripped.starts_with('#') || !stripped.contains(':') {
            continue;
        }
        let Some((key, raw_value)) = stripped.split_once(':') else {
            continue;
        };
        let mut value = raw_value.trim().to_string();
        if value.len() >= 2
            && ((value.starts_with('"') && value.ends_with('"'))
                || (value.starts_with('\'') && value.ends_with('\'')))
        {
            value = value[1..value.len() - 1].to_string();
        }
        let key = key.trim();
        if !key.is_empty() {
            values.insert(key.to_string(), json!(value));
        }
    }
    values
}

fn first_heading(markdown: &str) -> String {
    markdown
        .lines()
        .map(str::trim)
        .find(|line| line.starts_with('#'))
        .map(|line| line.trim_start_matches('#').trim().to_string())
        .unwrap_or_default()
}

fn first_paragraph(markdown: &str) -> String {
    let (_, body) = split_frontmatter(markdown);
    let mut chunks = Vec::new();
    let mut in_code = false;
    for line in body.lines() {
        let stripped = line.trim();
        if stripped.starts_with("```") {
            in_code = !in_code;
            continue;
        }
        if in_code || stripped.starts_with('#') || stripped.starts_with('-') {
            continue;
        }
        if !stripped.is_empty() {
            chunks.push(stripped);
        } else if !chunks.is_empty() {
            break;
        }
    }
    compact_description(chunks.join(" "))
        .chars()
        .take(320)
        .collect()
}

fn category_for(relative_path: &str) -> String {
    let mut parts: Vec<&str> = relative_path.split('/').collect();
    parts.pop();
    if parts.first() == Some(&"skills") {
        parts.remove(0);
    }
    if parts.len() > 1 {
        parts.pop();
    }
    if parts.is_empty() {
        "uncategorized".to_string()
    } else {
        parts.join("/")
    }
}

fn normalize_github_url(input: &str) -> Result<RepoInfo, String> {
    let trimmed = input.trim();
    if let Some(rest) = trimmed.strip_prefix("git@github.com:") {
        let rest = rest.trim_end_matches('/').trim_end_matches(".git");
        let (owner, repo) = split_owner_repo(rest)?;
        return github_repo_info(owner, repo, format!("git@github.com:{owner}/{repo}.git"));
    }
    if let Some(rest) = trimmed.strip_prefix("ssh://git@github.com/") {
        let rest = rest.trim_end_matches('/').trim_end_matches(".git");
        let (owner, repo) = split_owner_repo(rest)?;
        return github_repo_info(
            owner,
            repo,
            format!("ssh://git@github.com/{owner}/{repo}.git"),
        );
    }
    if let Some(rest) = trimmed.strip_prefix("git@gitlab.com:") {
        let rest = rest.trim_end_matches('/').trim_end_matches(".git");
        return gitlab_repo_info(rest, format!("git@gitlab.com:{rest}.git"));
    }
    if let Some(rest) = trimmed.strip_prefix("ssh://git@gitlab.com/") {
        let rest = rest.trim_end_matches('/').trim_end_matches(".git");
        return gitlab_repo_info(rest, format!("ssh://git@gitlab.com/{rest}.git"));
    }
    if let Some(rest) = trimmed
        .strip_prefix("https://github.com/")
        .or_else(|| trimmed.strip_prefix("http://github.com/"))
    {
        let rest = rest.trim_end_matches('/').trim_end_matches(".git");
        let (owner, repo) = split_owner_repo(rest)?;
        return github_repo_info(
            owner,
            repo,
            format!("https://github.com/{owner}/{repo}.git"),
        );
    }
    if let Some(rest) = trimmed
        .strip_prefix("https://gitlab.com/")
        .or_else(|| trimmed.strip_prefix("http://gitlab.com/"))
    {
        let rest = rest.trim_end_matches('/').trim_end_matches(".git");
        let namespace = gitlab_namespace_from_url_path(rest);
        return gitlab_repo_info(&namespace, format!("https://gitlab.com/{namespace}.git"));
    }
    Err("Only GitHub and GitLab repository URLs are supported.".to_string())
}

fn split_owner_repo(path: &str) -> Result<(&str, &str), String> {
    let mut parts = path.split('/').filter(|part| !part.is_empty());
    let owner = parts
        .next()
        .ok_or_else(|| "GitHub URL must include owner and repository.".to_string())?;
    let repo = parts
        .next()
        .ok_or_else(|| "GitHub URL must include owner and repository.".to_string())?;
    Ok((owner, repo))
}

fn github_repo_info(owner: &str, repo: &str, clone_url: String) -> Result<RepoInfo, String> {
    if !is_repo_path_segment(owner) || !is_repo_path_segment(repo) {
        return Err("GitHub owner or repository name contains unsupported characters.".to_string());
    }
    let name = format!("{owner}/{repo}");
    Ok(RepoInfo {
        id: format!("github:{name}").to_lowercase(),
        name,
        slug: sanitize_slug(&format!("{owner}--{repo}")).to_lowercase(),
        url: format!("https://github.com/{owner}/{repo}"),
        clone_url,
    })
}

fn gitlab_repo_info(namespace_path: &str, clone_url: String) -> Result<RepoInfo, String> {
    let parts: Vec<&str> = namespace_path.split('/').filter(|part| !part.is_empty()).collect();
    if parts.len() < 2 || !parts.iter().all(|part| is_repo_path_segment(part)) {
        return Err("GitLab URL must include a namespace and repository.".to_string());
    }
    let name = parts.join("/");
    Ok(RepoInfo {
        id: format!("gitlab:{name}").to_lowercase(),
        name: name.clone(),
        slug: sanitize_slug(&format!("gitlab--{name}")).to_lowercase(),
        url: format!("https://gitlab.com/{name}"),
        clone_url,
    })
}

fn gitlab_namespace_from_url_path(path: &str) -> String {
    let parts: Vec<&str> = path.split('/').filter(|part| !part.is_empty()).collect();
    let route_index = parts.iter().position(|part| *part == "-").unwrap_or(parts.len());
    parts[..route_index].join("/")
}

fn clone_or_pull(repo: &RepoInfo) -> Result<(), String> {
    let target = repos_dir().join(&repo.slug);
    fs::create_dir_all(repos_dir())
        .map_err(|error| format!("Failed to create repository cache: {error}"))?;
    if target.join(".git").exists() {
        run_git(&["pull", "--ff-only"], Some(&target))?;
        return Ok(());
    }
    if target.exists() {
        return Err(format!(
            "Import target exists but is not a Git repository: {}",
            target.display()
        ));
    }
    run_git(
        &[
            "clone",
            "--depth",
            "1",
            repo.clone_url.as_str(),
            &target.to_string_lossy(),
        ],
        None,
    )?;
    Ok(())
}

fn run_git(args: &[&str], cwd: Option<&Path>) -> Result<String, String> {
    let mut command = Command::new("git");
    command.args(args);
    if let Some(cwd) = cwd {
        command.current_dir(cwd);
    }
    let output = command
        .output()
        .map_err(|error| format!("git is required for repository operations: {error}"))?;
    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout).trim().to_string())
    } else {
        let stderr = String::from_utf8_lossy(&output.stderr).trim().to_string();
        Err(if stderr.is_empty() {
            "Git command failed.".to_string()
        } else {
            stderr
        })
    }
}

fn install_targets() -> Vec<InstallTargetData> {
    let home = env::var("HOME").unwrap_or_default();
    let project = repo_root();
    vec![
        InstallTargetData {
            id: "codex-global".to_string(),
            tool_id: "codex".to_string(),
            label: "Codex global".to_string(),
            skills_dir: PathBuf::from(&home).join(".codex").join("skills"),
            slash_commands_dir: Some(PathBuf::from(&home).join(".codex").join("prompts")),
        },
        InstallTargetData {
            id: "codex-project".to_string(),
            tool_id: "codex".to_string(),
            label: "Codex project".to_string(),
            skills_dir: project.join(".codex").join("skills"),
            slash_commands_dir: Some(project.join(".codex").join("prompts")),
        },
        InstallTargetData {
            id: "claude-code-global".to_string(),
            tool_id: "claude-code".to_string(),
            label: "Claude Code global".to_string(),
            skills_dir: PathBuf::from(&home).join(".claude").join("skills"),
            slash_commands_dir: Some(PathBuf::from(&home).join(".claude").join("commands")),
        },
        InstallTargetData {
            id: "claude-code-project".to_string(),
            tool_id: "claude-code".to_string(),
            label: "Claude Code project".to_string(),
            skills_dir: project.join(".claude").join("skills"),
            slash_commands_dir: Some(project.join(".claude").join("commands")),
        },
        InstallTargetData {
            id: "amp-global".to_string(),
            tool_id: "amp".to_string(),
            label: "Amp global".to_string(),
            skills_dir: PathBuf::from(&home).join(".agents").join("skills"),
            slash_commands_dir: None,
        },
        InstallTargetData {
            id: "amp-project".to_string(),
            tool_id: "amp".to_string(),
            label: "Amp project".to_string(),
            skills_dir: project.join(".agents").join("skills"),
            slash_commands_dir: None,
        },
    ]
}

fn target_to_value(target: InstallTargetData) -> Value {
    json!({
        "id": target.id,
        "toolId": target.tool_id,
        "label": target.label,
        "skillsDir": target.skills_dir,
        "slashCommandsDir": target.slash_commands_dir,
        "exists": target.skills_dir.exists()
    })
}

fn install_item(
    source: &ResolvedSkillSource,
    target: &InstallTargetData,
    destination: &Path,
    status: &str,
    message: Option<&str>,
) -> Value {
    json!({
        "skillId": source.skill_id,
        "targetId": target.id,
        "destinationPath": destination,
        "status": status,
        "message": message
    })
}

fn install_slash_command(
    source: &ResolvedSkillSource,
    target: &InstallTargetData,
    overwrite: bool,
) -> Result<(), String> {
    if !is_manual_skill(source) {
        return Ok(());
    }
    let Some(dir) = &target.slash_commands_dir else {
        return Ok(());
    };
    let file = slash_command_file(dir, source);
    if file.exists() && !overwrite && !is_managed_slash_command(&file, &source.install_name) {
        return Ok(());
    }
    fs::create_dir_all(dir)
        .map_err(|error| format!("Failed to create {}: {error}", dir.display()))?;
    fs::write(&file, slash_command_content(source, target))
        .map_err(|error| format!("Failed to write slash command {}: {error}", file.display()))
}

fn upsert_manifest(
    target: &InstallTargetData,
    source: &ResolvedSkillSource,
    mode: &str,
) -> Result<(), String> {
    fs::create_dir_all(&target.skills_dir).map_err(|error| {
        format!(
            "Failed to create target dir {}: {error}",
            target.skills_dir.display()
        )
    })?;
    let manifest = manifest_file(target);
    let mut lines = read_manifest_lines(&manifest)
        .into_iter()
        .filter(|line| line.split('\t').next() != Some(source.install_name.as_str()))
        .collect::<Vec<_>>();
    lines.push(format!(
        "{}\t{}\t{}\t{}",
        source.install_name,
        mode,
        source.source_dir.display(),
        now_iso()
    ));
    fs::write(&manifest, format!("{}\n", lines.join("\n")))
        .map_err(|error| format!("Failed to write manifest {}: {error}", manifest.display()))
}

fn remove_manifest_entry(
    target: &InstallTargetData,
    source: &ResolvedSkillSource,
) -> Result<(), String> {
    let manifest = manifest_file(target);
    let lines = read_manifest_lines(&manifest);
    if lines.is_empty() {
        return Ok(());
    }
    let next = lines
        .into_iter()
        .filter(|line| line.split('\t').next() != Some(source.install_name.as_str()))
        .collect::<Vec<_>>();
    if next.is_empty() {
        fs::remove_file(&manifest)
            .or_else(|error| {
                if error.kind() == io::ErrorKind::NotFound {
                    Ok(())
                } else {
                    Err(error)
                }
            })
            .map_err(|error| format!("Failed to remove manifest {}: {error}", manifest.display()))
    } else {
        fs::write(&manifest, format!("{}\n", next.join("\n")))
            .map_err(|error| format!("Failed to write manifest {}: {error}", manifest.display()))
    }
}

fn has_manifest_entry(target: &InstallTargetData, source: &ResolvedSkillSource) -> bool {
    read_manifest_lines(&manifest_file(target))
        .iter()
        .any(|line| line.split('\t').next() == Some(source.install_name.as_str()))
}

fn manifest_file(target: &InstallTargetData) -> PathBuf {
    target.skills_dir.join(".skills-linker-manifest.tsv")
}

fn read_manifest_lines(path: &Path) -> Vec<String> {
    fs::read_to_string(path)
        .map(|content| {
            content
                .lines()
                .filter(|line| !line.trim().is_empty())
                .map(ToString::to_string)
                .collect()
        })
        .unwrap_or_default()
}

fn remove_slash_command(
    source: &ResolvedSkillSource,
    target: &InstallTargetData,
) -> Result<(), String> {
    if !is_manual_skill(source) {
        return Ok(());
    }
    let Some(dir) = &target.slash_commands_dir else {
        return Ok(());
    };
    let file = slash_command_file(dir, source);
    if is_managed_slash_command(&file, &source.install_name) {
        fs::remove_file(&file).map_err(|error| {
            format!("Failed to remove slash command {}: {error}", file.display())
        })?;
    }
    Ok(())
}

fn is_manual_skill(source: &ResolvedSkillSource) -> bool {
    source.category == "manual"
        || source.category.starts_with("manual/")
        || source.relative_path.starts_with("manual/")
}

fn slash_command_file(dir: &Path, source: &ResolvedSkillSource) -> PathBuf {
    dir.join(format!("{}.md", source.install_name))
}

fn slash_command_content(source: &ResolvedSkillSource, target: &InstallTargetData) -> String {
    let marker = format!("<!-- skills-linker:slash:{} -->", source.install_name);
    let skill_file = source.source_dir.join("SKILL.md");
    if target.tool_id == "claude-code" {
        return format!(
            "---\ndescription: {}\nargument-hint: [extra context]\n---\n{}\n\nUse the `{}` skill for this request. Read its definition at:\n{}\n\n$ARGUMENTS\n",
            if source.summary.is_empty() {
                format!("Invoke the {} skill", source.install_name)
            } else {
                source.summary.clone()
            },
            marker,
            source.install_name,
            skill_file.display()
        );
    }
    format!(
        "{}\n\nUse the `{}` skill for this request. Read its definition at:\n{}\n",
        marker,
        source.install_name,
        skill_file.display()
    )
}

fn is_managed_slash_command(file: &Path, install_name: &str) -> bool {
    fs::read_to_string(file)
        .map(|content| content.contains(&format!("<!-- skills-linker:slash:{install_name} -->")))
        .unwrap_or(false)
}

fn copy_dir_all(source: &Path, destination: &Path) -> io::Result<()> {
    fs::create_dir_all(destination)?;
    for entry in fs::read_dir(source)? {
        let entry = entry?;
        let file_type = entry.file_type()?;
        let destination_path = destination.join(entry.file_name());
        if file_type.is_dir() {
            copy_dir_all(&entry.path(), &destination_path)?;
        } else {
            fs::copy(entry.path(), destination_path)?;
        }
    }
    Ok(())
}

fn remove_existing(path: &Path) -> io::Result<()> {
    if path.is_dir() && !path.is_symlink() {
        fs::remove_dir_all(path)
    } else {
        fs::remove_file(path)
    }
}

fn is_path_inside(child: &Path, parent: &Path) -> bool {
    match (child.canonicalize(), parent.canonicalize()) {
        (Ok(child), Ok(parent)) => child.starts_with(parent),
        _ => child.starts_with(parent),
    }
}

#[cfg(unix)]
fn create_dir_symlink(source: &Path, destination: &Path) -> Result<(), String> {
    std::os::unix::fs::symlink(source, destination).map_err(|error| {
        format!(
            "Failed to symlink {} to {}: {error}",
            source.display(),
            destination.display()
        )
    })
}

#[cfg(windows)]
fn create_dir_symlink(source: &Path, destination: &Path) -> Result<(), String> {
    std::os::windows::fs::symlink_dir(source, destination).map_err(|error| {
        format!(
            "Failed to symlink {} to {}: {error}",
            source.display(),
            destination.display()
        )
    })
}

#[cfg(not(any(unix, windows)))]
fn create_dir_symlink(_source: &Path, _destination: &Path) -> Result<(), String> {
    Err("Symlink install mode is not supported on this platform yet.".to_string())
}

fn load_library() -> Result<Value, String> {
    let file = library_file();
    match fs::read_to_string(&file) {
        Ok(content) => serde_json::from_str(&content)
            .map_err(|error| format!("Failed to parse {}: {error}", file.display())),
        Err(_) => Ok(json!({ "version": 1, "repositories": [] })),
    }
}

fn save_library(library: &Value) -> Result<(), String> {
    let file = library_file();
    if let Some(parent) = file.parent() {
        fs::create_dir_all(parent)
            .map_err(|error| format!("Failed to create {}: {error}", parent.display()))?;
    }
    fs::write(
        &file,
        format!(
            "{}\n",
            serde_json::to_string_pretty(library).map_err(|error| error.to_string())?
        ),
    )
    .map_err(|error| format!("Failed to write {}: {error}", file.display()))
}

fn load_config() -> Result<Value, String> {
    let file = config_file();
    match fs::read_to_string(&file) {
        Ok(content) => serde_json::from_str(&content)
            .map_err(|error| format!("Failed to parse {}: {error}", file.display())),
        Err(_) => Ok(json!({})),
    }
}

fn save_config(config: &Value) -> Result<(), String> {
    let file = config_file();
    if let Some(parent) = file.parent() {
        fs::create_dir_all(parent)
            .map_err(|error| format!("Failed to create {}: {error}", parent.display()))?;
    }
    fs::write(
        &file,
        format!(
            "{}\n",
            serde_json::to_string_pretty(config).map_err(|error| error.to_string())?
        ),
    )
    .map_err(|error| format!("Failed to write {}: {error}", file.display()))
}

fn openai_api_key() -> Result<Option<String>, String> {
    if let Ok(value) = env::var("OPENAI_API_KEY") {
        if !value.trim().is_empty() {
            return Ok(Some(value));
        }
    }
    Ok(load_config()?
        .get("translation")
        .and_then(|value| value.get("openai"))
        .and_then(|value| value.get("apiKey"))
        .and_then(Value::as_str)
        .filter(|value| !value.trim().is_empty())
        .map(ToString::to_string))
}

fn openrouter_api_key() -> Result<Option<String>, String> {
    if let Ok(value) = env::var("OPENROUTER_API_KEY") {
        if !value.trim().is_empty() {
            return Ok(Some(value));
        }
    }
    Ok(load_config()?
        .get("translation")
        .and_then(|value| value.get("openrouter"))
        .and_then(|value| value.get("apiKey"))
        .and_then(Value::as_str)
        .filter(|value| !value.trim().is_empty())
        .map(ToString::to_string))
}

fn openai_model() -> Result<String, String> {
    if let Ok(value) = env::var("SKILLS_MANAGER_OPENAI_MODEL") {
        if !value.trim().is_empty() {
            return Ok(value);
        }
    }
    Ok(load_config()?
        .get("translation")
        .and_then(|value| value.get("openai"))
        .and_then(|value| value.get("model"))
        .and_then(Value::as_str)
        .filter(|value| !value.trim().is_empty())
        .map(ToString::to_string)
        .unwrap_or_else(|| "gpt-5".to_string()))
}

fn openrouter_model() -> Result<String, String> {
    if let Ok(value) = env::var("SKILLS_MANAGER_OPENROUTER_MODEL") {
        if !value.trim().is_empty() {
            return Ok(value);
        }
    }
    Ok(load_config()?
        .get("translation")
        .and_then(|value| value.get("openrouter"))
        .and_then(|value| value.get("model"))
        .and_then(Value::as_str)
        .filter(|value| !value.trim().is_empty())
        .map(ToString::to_string)
        .unwrap_or_else(|| "openai/gpt-5".to_string()))
}

fn configurable_translation_provider_key(provider_id: &str) -> Result<&'static str, String> {
    match provider_id.trim() {
        "openai" => Ok("openai"),
        "openrouter" => Ok("openrouter"),
        "codex" | "claude-code" | "amp" => Err(format!(
            "{} uses the local command line and does not accept API key configuration.",
            provider_label(provider_id)
        )),
        value => Err(format!("Unsupported translation provider: {value}")),
    }
}

fn provider_label(provider_id: &str) -> &'static str {
    match provider_id {
        "codex" => "Local Codex",
        "claude-code" => "Local Claude Code",
        "amp" => "Local Amp",
        "openrouter" => "OpenRouter",
        "openai" => "OpenAI",
        _ => "Translation provider",
    }
}

fn repo_root() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .ancestors()
        .nth(3)
        .unwrap_or_else(|| Path::new(env!("CARGO_MANIFEST_DIR")))
        .to_path_buf()
}

fn data_dir() -> PathBuf {
    env::var("SKILLS_MANAGER_DATA_DIR")
        .map(PathBuf::from)
        .unwrap_or_else(|_| repo_root().join(".skills-manager-data"))
}

fn repos_dir() -> PathBuf {
    data_dir().join("repos")
}

fn library_file() -> PathBuf {
    data_dir().join("library.json")
}

fn config_file() -> PathBuf {
    data_dir().join("config.json")
}

fn group_to_value(group: &GroupData) -> Value {
    json!({
        "id": group.id,
        "name": group.name,
        "kind": group.kind,
        "url": group.url,
        "path": group.path,
        "importedAt": group.imported_at,
        "updatedAt": group.updated_at
    })
}

fn map_get(map: &Map<String, Value>, key: &str) -> Option<String> {
    map.get(key)
        .and_then(Value::as_str)
        .map(ToString::to_string)
}

fn string_field(value: &Value, key: &str) -> Option<String> {
    value
        .get(key)
        .and_then(Value::as_str)
        .map(ToString::to_string)
}

fn get_string(value: &Value, key: &str) -> Result<String, String> {
    string_field(value, key).ok_or_else(|| format!("Missing string field: {key}"))
}

fn required_trimmed_string(value: &Value, key: &str, message: &str) -> Result<String, String> {
    let value = get_string(value, key)?;
    let trimmed = value.trim();
    if trimmed.is_empty() {
        return Err(message.to_string());
    }
    Ok(trimmed.to_string())
}

fn get_string_array(value: &Value, key: &str) -> Result<Vec<String>, String> {
    value
        .get(key)
        .and_then(Value::as_array)
        .ok_or_else(|| format!("Missing string array field: {key}"))?
        .iter()
        .map(|item| {
            item.as_str()
                .map(ToString::to_string)
                .ok_or_else(|| format!("Invalid string array field: {key}"))
        })
        .collect()
}

fn bool_field(value: &Value, key: &str) -> Option<bool> {
    value.get(key).and_then(Value::as_bool)
}

fn value_string(value: &Value, key: &str) -> String {
    string_field(value, key).unwrap_or_default()
}

fn first_non_empty(values: &[Option<String>]) -> Option<String> {
    values
        .iter()
        .flatten()
        .find(|value| !value.trim().is_empty())
        .cloned()
}

fn parent_dir_name(relative_path: &str) -> Option<String> {
    relative_path
        .rsplit_once('/')
        .and_then(|(dir, _)| dir.rsplit('/').next())
        .map(ToString::to_string)
}

fn compact_description(value: String) -> String {
    value.split_whitespace().collect::<Vec<_>>().join(" ")
}

fn sanitize_install_name(value: &str) -> String {
    let sanitized = value
        .trim()
        .chars()
        .map(|ch| {
            if ch.is_ascii_alphanumeric() || matches!(ch, '-' | '_' | '.') {
                ch
            } else {
                '-'
            }
        })
        .collect::<String>()
        .trim_matches('-')
        .to_string();
    if sanitized.is_empty() {
        "skill".to_string()
    } else {
        sanitized
    }
}

fn encode_skill_id(group_id: &str, relative_path: &str) -> String {
    format!(
        "{}::{}",
        encode_component(group_id),
        encode_component(relative_path)
    )
}

fn decode_skill_id(skill_id: &str) -> Result<(String, String), String> {
    let (group_id, relative_path) = skill_id
        .split_once("::")
        .ok_or_else(|| "Invalid skill id.".to_string())?;
    Ok((
        decode_component(group_id)?,
        decode_component(relative_path)?,
    ))
}

fn encode_component(input: &str) -> String {
    let mut output = String::new();
    for byte in input.bytes() {
        if byte.is_ascii_alphanumeric() || matches!(byte, b'-' | b'_' | b'.' | b'~') {
            output.push(byte as char);
        } else {
            output.push_str(&format!("%{byte:02X}"));
        }
    }
    output
}

fn decode_component(input: &str) -> Result<String, String> {
    let bytes = input.as_bytes();
    let mut output = Vec::new();
    let mut index = 0;
    while index < bytes.len() {
        if bytes[index] == b'%' {
            if index + 2 >= bytes.len() {
                return Err("Invalid percent-encoded skill id.".to_string());
            }
            let hex = std::str::from_utf8(&bytes[index + 1..index + 3])
                .map_err(|error| error.to_string())?;
            let byte = u8::from_str_radix(hex, 16).map_err(|error| error.to_string())?;
            output.push(byte);
            index += 3;
        } else {
            output.push(bytes[index]);
            index += 1;
        }
    }
    String::from_utf8(output).map_err(|error| error.to_string())
}

fn translation_source_markdown(detail: &Value, source_mode: &str) -> Result<String, String> {
    let content = get_string(detail, "content")?;
    if source_mode != "summary" {
        return Ok(content);
    }
    let title = string_field(detail, "title").unwrap_or_else(|| "Skill".to_string());
    let mut sections = vec![format!("# {title}")];
    if let Some(description) = string_field(detail, "description").filter(|value| !value.trim().is_empty()) {
        sections.push(description);
    }
    let references = extract_markdown_section(&content, "References");
    if !references.is_empty() {
        sections.push(format!("## References\n\n{references}"));
    }
    Ok(sections.join("\n\n"))
}

fn extract_markdown_section(markdown: &str, heading: &str) -> String {
    let heading_marker = format!("## {}", heading.to_ascii_lowercase());
    let mut started = false;
    let mut lines = Vec::new();
    for line in markdown.lines() {
        let trimmed = line.trim();
        if started {
            if trimmed.starts_with("## ") {
                break;
            }
            lines.push(line);
        } else if trimmed.to_ascii_lowercase() == heading_marker {
            started = true;
        }
    }
    lines.join("\n").trim().to_string()
}

fn translation_instructions(target_language: &str) -> String {
    [
        "You are a precise technical translator.".to_string(),
        format!("Translate the Markdown skill documentation into {target_language}."),
        "Preserve Markdown structure, fenced code blocks, YAML front matter keys, command names, paths, placeholders, and examples.".to_string(),
        "Return only the translated Markdown.".to_string(),
    ]
    .join(" ")
}

fn translate_with_openai(skill_id: &str, target_language: &str, markdown: &str) -> Result<Value, String> {
    let api_key = openai_api_key()?.ok_or_else(|| {
        "OpenAI translation provider is not configured. Set OPENAI_API_KEY or save an OpenAI key in the desktop app.".to_string()
    })?;
    let model = openai_model()?;
    let payload = json!({
        "model": model,
        "instructions": translation_instructions(target_language),
        "input": markdown,
        "max_output_tokens": 8000
    });
    let response = curl_json(
        "https://api.openai.com/v1/responses",
        &api_key,
        &payload,
        "OpenAI translation failed",
    )?;
    Ok(json!({
        "skillId": skill_id,
        "providerId": "openai",
        "targetLanguage": target_language,
        "markdown": extract_response_text(&response).trim(),
        "model": model
    }))
}

fn translate_with_openrouter(skill_id: &str, target_language: &str, markdown: &str) -> Result<Value, String> {
    let api_key = openrouter_api_key()?.ok_or_else(|| {
        "OpenRouter translation provider is not configured. Set OPENROUTER_API_KEY or save an OpenRouter key in the desktop app.".to_string()
    })?;
    let model = openrouter_model()?;
    let payload = json!({
        "model": model,
        "messages": [
            {
                "role": "system",
                "content": translation_instructions(target_language)
            },
            {
                "role": "user",
                "content": markdown
            }
        ]
    });
    let response = curl_json(
        "https://openrouter.ai/api/v1/chat/completions",
        &api_key,
        &payload,
        "OpenRouter translation failed",
    )?;
    Ok(json!({
        "skillId": skill_id,
        "providerId": "openrouter",
        "targetLanguage": target_language,
        "markdown": extract_chat_completion_text(&response).trim(),
        "model": model
    }))
}

fn translate_with_local_agent(
    provider_id: &str,
    skill_id: &str,
    target_language: &str,
    markdown: &str,
) -> Result<Value, String> {
    let prompt = format!(
        "{}\n\nMarkdown:\n\n{}",
        translation_instructions(target_language),
        markdown
    );
    let codex_output_file = if provider_id == "codex" {
        let nanos = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .map(|duration| duration.as_nanos())
            .unwrap_or_default();
        Some(env::temp_dir().join(format!(
            "skills-manager-codex-last-{}-{nanos}.md",
            std::process::id()
        )))
    } else {
        None
    };
    let command = match provider_id {
        "codex" => {
            let mut command = Command::new("codex");
            command.args([
                "exec",
                "--skip-git-repo-check",
                "--ignore-rules",
                "-c",
                "model_reasoning_effort=\"low\"",
                "--sandbox",
                "read-only",
                "--ephemeral",
            ]);
            if let Some(path) = &codex_output_file {
                command.arg("--output-last-message");
                command.arg(path);
            }
            command.arg(&prompt);
            command
        }
        "claude-code" => {
            let mut command = Command::new("claude");
            command.args(["-p", "--no-session-persistence", &prompt]);
            command
        }
        "amp" => {
            let mut command = Command::new("amp");
            command.args(["--no-ide", "--no-notifications", "-x", &prompt]);
            command
        }
        _ => return Err(format!("Unsupported translation provider: {provider_id}")),
    };
    let timeout = if provider_id == "amp" {
        std::time::Duration::from_secs(45)
    } else {
        std::time::Duration::from_secs(180)
    };
    let output = run_agent_command(command, timeout, provider_label(provider_id))
        .map_err(|error| normalize_local_agent_error(provider_id, &error))?;
    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr).trim().to_string();
        return Err(if stderr.is_empty() {
            format!("{} translation command failed.", provider_label(provider_id))
        } else {
            normalize_local_agent_error(provider_id, &stderr)
        });
    }
    let stdout = String::from_utf8_lossy(&output.stdout).trim().to_string();
    let file_output = codex_output_file
        .as_ref()
        .and_then(|path| fs::read_to_string(path).ok())
        .unwrap_or_default()
        .trim()
        .to_string();
    if let Some(path) = &codex_output_file {
        let _ = fs::remove_file(path);
    }
    let translated_markdown = if stdout.is_empty() { file_output } else { stdout };
    if translated_markdown.is_empty() {
        let stderr = String::from_utf8_lossy(&output.stderr).trim().to_string();
        if !stderr.is_empty() {
            return Err(normalize_local_agent_error(provider_id, &stderr));
        }
        return Err(format!(
            "{} translation command returned no output.",
            provider_label(provider_id)
        ));
    }
    Ok(json!({
        "skillId": skill_id,
        "providerId": provider_id,
        "targetLanguage": target_language,
        "markdown": translated_markdown
    }))
}

fn normalize_local_agent_error(provider_id: &str, message: &str) -> String {
    if provider_id != "amp" {
        return message.to_string();
    }
    let normalized = message.to_ascii_lowercase();
    if normalized.contains("paid credits")
        || normalized.contains("amp free")
        || normalized.contains("execute mode")
        || normalized.contains("402")
    {
        return format!(
            "{} is installed, but non-interactive translation uses `amp -x`, which requires Amp paid credits. Add Amp paid credits or configure AMP_API_KEY for an account that supports execute mode, then retry.",
            provider_label(provider_id)
        );
    }
    if normalized.contains("certificate verification") {
        return format!(
            "{} is installed, but Amp could not reach its service because certificate verification failed. Fix Amp network or certificate settings, then retry.",
            provider_label(provider_id)
        );
    }
    message.to_string()
}

fn run_agent_command(mut command: Command, timeout: std::time::Duration, label: &str) -> Result<Output, String> {
    command.stdout(Stdio::piped()).stderr(Stdio::piped());
    let mut child = command
        .spawn()
        .map_err(|error| format!("Failed to run {label}: {error}"))?;
    let started = std::time::Instant::now();
    loop {
        match child.try_wait() {
            Ok(Some(_status)) => return child.wait_with_output().map_err(|error| error.to_string()),
            Ok(None) => {
                if started.elapsed() >= timeout {
                    let _ = child.kill();
                    let _ = child.wait();
                    return Err(format!(
                        "{label} translation command timed out after {} seconds.",
                        timeout.as_secs()
                    ));
                }
                std::thread::sleep(std::time::Duration::from_millis(100));
            }
            Err(error) => return Err(error.to_string()),
        }
    }
}

fn curl_json(endpoint: &str, api_key: &str, payload: &Value, error_label: &str) -> Result<Value, String> {
    let output = Command::new("curl")
        .args([
            "-sS",
            "--connect-timeout",
            "20",
            "--retry",
            "2",
            "--retry-all-errors",
            "--retry-delay",
            "1",
            endpoint,
            "-H",
            &format!("Authorization: Bearer {api_key}"),
            "-H",
            "Content-Type: application/json",
            "-d",
            &payload.to_string(),
        ])
        .output()
        .map_err(|error| format!("Failed to run curl for translation: {error}"))?;
    if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr).trim().to_string());
    }
    let response: Value = serde_json::from_slice(&output.stdout)
        .map_err(|error| format!("Failed to parse translation response: {error}"))?;
    if response.get("error").is_some() {
        return Err(format!("{error_label}: {response}"));
    }
    Ok(response)
}

fn extract_response_text(value: &Value) -> String {
    if value.get("type").and_then(Value::as_str) == Some("output_text") {
        return value
            .get("text")
            .and_then(Value::as_str)
            .unwrap_or_default()
            .to_string();
    }
    match value {
        Value::Array(items) => items
            .iter()
            .map(extract_response_text)
            .filter(|part| !part.is_empty())
            .collect::<Vec<_>>()
            .join("\n"),
        Value::Object(map) => map
            .values()
            .map(extract_response_text)
            .filter(|part| !part.is_empty())
            .collect::<Vec<_>>()
            .join("\n"),
        _ => String::new(),
    }
}

fn extract_chat_completion_text(value: &Value) -> String {
    value
        .get("choices")
        .and_then(Value::as_array)
        .map(|choices| {
            choices
                .iter()
                .filter_map(|choice| {
                    choice
                        .get("message")
                        .and_then(|message| message.get("content"))
                        .and_then(Value::as_str)
                })
                .collect::<Vec<_>>()
                .join("\n")
        })
        .unwrap_or_default()
}

fn command_available(command: &str) -> bool {
    Command::new(command).arg("--version").output().is_ok()
}

fn now_iso() -> String {
    match Command::new("date")
        .args(["-u", "+%Y-%m-%dT%H:%M:%SZ"])
        .output()
    {
        Ok(output) if output.status.success() => {
            String::from_utf8_lossy(&output.stdout).trim().to_string()
        }
        _ => "1970-01-01T00:00:00Z".to_string(),
    }
}

fn should_skip_dir(name: &str) -> bool {
    matches!(
        name,
        ".git"
            | ".hg"
            | ".svn"
            | ".ref"
            | ".venv"
            | "venv"
            | "node_modules"
            | "__pycache__"
            | ".skills-manager-data"
    )
}

fn is_repo_path_segment(value: &str) -> bool {
    !value.is_empty()
        && value
            .chars()
            .all(|ch| ch.is_ascii_alphanumeric() || matches!(ch, '_' | '.' | '-'))
}

fn sanitize_slug(value: &str) -> String {
    let mut slug = String::new();
    for ch in value.chars() {
        if ch.is_ascii_alphanumeric() || matches!(ch, '_' | '.' | '-') {
            slug.push(ch);
        } else if !slug.ends_with('-') {
            slug.push('-');
        }
    }
    slug.trim_matches('-').to_string()
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::sync::Mutex;
    use std::time::{SystemTime, UNIX_EPOCH};

    static ENV_LOCK: Mutex<()> = Mutex::new(());

    #[test]
    fn encodes_and_decodes_skill_ids() {
        let encoded = encode_skill_id("local:workspace", "manual/review/api-design/SKILL.md");
        assert_eq!(
            decode_skill_id(&encoded).unwrap(),
            (
                "local:workspace".to_string(),
                "manual/review/api-design/SKILL.md".to_string()
            )
        );
    }

    #[test]
    fn normalizes_github_urls() {
        let info = normalize_github_url("https://github.com/openai/codex.git").unwrap();
        assert_eq!(info.id, "github:openai/codex");
        assert_eq!(info.slug, "openai--codex");
        assert_eq!(info.clone_url, "https://github.com/openai/codex.git");
    }

    #[test]
    fn normalizes_gitlab_urls() {
        let info = normalize_github_url("https://gitlab.com/acme/platform/skills.git").unwrap();
        assert_eq!(info.id, "gitlab:acme/platform/skills");
        assert_eq!(info.name, "acme/platform/skills");
        assert_eq!(info.slug, "gitlab--acme-platform-skills");
        assert_eq!(info.clone_url, "https://gitlab.com/acme/platform/skills.git");

        let tree_url = normalize_github_url("https://gitlab.com/acme/platform/skills/-/tree/main").unwrap();
        assert_eq!(tree_url.id, "gitlab:acme/platform/skills");
        assert_eq!(tree_url.clone_url, "https://gitlab.com/acme/platform/skills.git");
    }

    #[test]
    fn scans_local_workspace_skills() {
        let sources = read_skill_sources(&repo_root().join("skills")).unwrap();
        assert_eq!(sources.len(), 24);
        assert!(sources
            .iter()
            .any(|source| source.relative_path == "auto/in-english/SKILL.md"));
    }

    #[test]
    fn builds_library_from_current_workspace() {
        let library = build_library().unwrap();
        let groups = library.get("groups").and_then(Value::as_array).unwrap();
        let local = groups
            .iter()
            .find(|group| group.get("id").and_then(Value::as_str) == Some("local:workspace"))
            .unwrap();
        assert_eq!(local.get("skillCount").and_then(Value::as_u64), Some(24));
        let skills = library.get("skills").and_then(Value::as_array).unwrap();
        assert!(skills
            .iter()
            .any(|skill| skill.get("title").and_then(Value::as_str) == Some("In English")));
    }

    #[test]
    fn installs_local_skill_to_temp_codex_home() {
        let _guard = ENV_LOCK.lock().unwrap();
        let old_home = env::var_os("HOME");
        let home = temp_dir("skills-manager-desktop-home");
        fs::create_dir_all(&home).unwrap();
        unsafe {
            env::set_var("HOME", &home);
        }

        let skill_id = encode_skill_id("local:workspace", "auto/in-english/SKILL.md");
        let result = install_skills(json!({
            "skillIds": [skill_id],
            "targetIds": ["codex-global"],
            "mode": "copy",
            "conflictPolicy": "fail"
        }))
        .unwrap();
        assert_eq!(
            result
                .get("items")
                .and_then(Value::as_array)
                .and_then(|items| items.first())
                .and_then(|item| item.get("status"))
                .and_then(Value::as_str),
            Some("installed")
        );
        assert!(home.join(".codex/skills/in-english/SKILL.md").exists());
        let manifest =
            fs::read_to_string(home.join(".codex/skills/.skills-linker-manifest.tsv")).unwrap();
        assert!(manifest.contains("in-english\tcopy\t"));

        let status = get_install_status(json!({ "skillIds": [skill_id] })).unwrap();
        assert_eq!(
            status
                .as_array()
                .unwrap()
                .iter()
                .find(|item| item.get("targetId").and_then(Value::as_str) == Some("codex-global"))
                .and_then(|item| item.get("installed"))
                .and_then(Value::as_bool),
            Some(true)
        );
        assert_eq!(
            status
                .as_array()
                .unwrap()
                .iter()
                .find(|item| item.get("targetId").and_then(Value::as_str) == Some("codex-global"))
                .and_then(|item| item.get("conflict"))
                .and_then(Value::as_bool),
            Some(false)
        );

        let uninstall_result = uninstall_skills(json!({
            "skillIds": [skill_id],
            "targetIds": ["codex-global"]
        }))
        .unwrap();
        assert_eq!(
            uninstall_result
                .get("items")
                .and_then(Value::as_array)
                .and_then(|items| items.first())
                .and_then(|item| item.get("status"))
                .and_then(Value::as_str),
            Some("uninstalled")
        );
        assert!(!home.join(".codex/skills/in-english/SKILL.md").exists());
        assert!(!home
            .join(".codex/skills/.skills-linker-manifest.tsv")
            .exists());

        let missing_result = uninstall_skills(json!({
            "skillIds": [skill_id],
            "targetIds": ["codex-global"]
        }))
        .unwrap();
        assert_eq!(
            missing_result
                .get("items")
                .and_then(Value::as_array)
                .and_then(|items| items.first())
                .and_then(|item| item.get("status"))
                .and_then(Value::as_str),
            Some("missing")
        );

        restore_home(old_home);
        fs::remove_dir_all(home).unwrap();
    }

    #[test]
    fn installs_local_skill_as_symlink() {
        let _guard = ENV_LOCK.lock().unwrap();
        let old_home = env::var_os("HOME");
        let home = temp_dir("skills-manager-desktop-home");
        fs::create_dir_all(&home).unwrap();
        unsafe {
            env::set_var("HOME", &home);
        }

        let skill_id = encode_skill_id("local:workspace", "auto/in-english/SKILL.md");
        let result = install_skills(json!({
            "skillIds": [skill_id.clone()],
            "targetIds": ["codex-global"],
            "mode": "symlink",
            "conflictPolicy": "fail"
        }))
        .unwrap();
        assert_eq!(
            result
                .get("items")
                .and_then(Value::as_array)
                .and_then(|items| items.first())
                .and_then(|item| item.get("status"))
                .and_then(Value::as_str),
            Some("installed")
        );
        let destination = home.join(".codex/skills/in-english");
        assert!(destination.is_symlink());
        assert!(destination.join("SKILL.md").exists());
        let manifest =
            fs::read_to_string(home.join(".codex/skills/.skills-linker-manifest.tsv")).unwrap();
        assert!(manifest.contains("in-english\tsymlink\t"));

        let uninstall_result = uninstall_skills(json!({
            "skillIds": [skill_id],
            "targetIds": ["codex-global"]
        }))
        .unwrap();
        assert_eq!(
            uninstall_result
                .get("items")
                .and_then(Value::as_array)
                .and_then(|items| items.first())
                .and_then(|item| item.get("status"))
                .and_then(Value::as_str),
            Some("uninstalled")
        );
        assert!(!destination.exists());

        restore_home(old_home);
        fs::remove_dir_all(home).unwrap();
    }

    #[test]
    fn install_rejects_unsupported_mode_and_conflict_policy() {
        let skill_id = encode_skill_id("local:workspace", "auto/in-english/SKILL.md");
        let invalid_mode = install_skills(json!({
            "skillIds": [skill_id.clone()],
            "targetIds": ["codex-global"],
            "mode": "move",
            "conflictPolicy": "fail"
        }))
        .unwrap_err();
        assert_eq!(invalid_mode, "Unsupported install mode: move");

        let invalid_policy = install_skills(json!({
            "skillIds": [skill_id],
            "targetIds": ["codex-global"],
            "mode": "copy",
            "conflictPolicy": "replace"
        }))
        .unwrap_err();
        assert_eq!(
            invalid_policy,
            "Unsupported install conflict policy: replace"
        );
    }

    #[test]
    fn install_and_uninstall_reject_unknown_target_ids() {
        let skill_id = encode_skill_id("local:workspace", "auto/in-english/SKILL.md");
        let install_error = install_skills(json!({
            "skillIds": [skill_id.clone()],
            "targetIds": ["missing-target"],
            "mode": "copy",
            "conflictPolicy": "fail"
        }))
        .unwrap_err();
        assert_eq!(install_error, "Unknown install target id: missing-target");

        let uninstall_error = uninstall_skills(json!({
            "skillIds": [skill_id],
            "targetIds": ["codex-global", "missing-target"]
        }))
        .unwrap_err();
        assert_eq!(uninstall_error, "Unknown install target id: missing-target");
    }

    #[test]
    fn uninstall_skips_unmanaged_destination() {
        let _guard = ENV_LOCK.lock().unwrap();
        let old_home = env::var_os("HOME");
        let home = temp_dir("skills-manager-desktop-home");
        let destination = home.join(".codex/skills/in-english");
        fs::create_dir_all(&destination).unwrap();
        fs::write(destination.join("SKILL.md"), "# User Skill\n").unwrap();
        unsafe {
            env::set_var("HOME", &home);
        }

        let skill_id = encode_skill_id("local:workspace", "auto/in-english/SKILL.md");
        let status = get_install_status(json!({ "skillIds": [skill_id.clone()] })).unwrap();
        let codex_status = status
            .as_array()
            .unwrap()
            .iter()
            .find(|item| item.get("targetId").and_then(Value::as_str) == Some("codex-global"))
            .unwrap();
        assert_eq!(
            codex_status.get("installed").and_then(Value::as_bool),
            Some(false)
        );
        assert_eq!(
            codex_status.get("conflict").and_then(Value::as_bool),
            Some(true)
        );

        let result = uninstall_skills(json!({
            "skillIds": [skill_id],
            "targetIds": ["codex-global"]
        }))
        .unwrap();
        assert_eq!(
            result
                .get("items")
                .and_then(Value::as_array)
                .and_then(|items| items.first())
                .and_then(|item| item.get("status"))
                .and_then(Value::as_str),
            Some("skipped")
        );
        assert!(destination.join("SKILL.md").exists());

        restore_home(old_home);
        fs::remove_dir_all(home).unwrap();
    }

    #[test]
    fn installs_manual_skill_with_codex_slash_command() {
        let _guard = ENV_LOCK.lock().unwrap();
        let old_home = env::var_os("HOME");
        let home = temp_dir("skills-manager-desktop-home");
        fs::create_dir_all(&home).unwrap();
        unsafe {
            env::set_var("HOME", &home);
        }

        let skill_id = encode_skill_id("local:workspace", "manual/plan/create/SKILL.md");
        let result = install_skills(json!({
            "skillIds": [skill_id.clone()],
            "targetIds": ["codex-global"],
            "mode": "copy",
            "conflictPolicy": "fail",
            "withSlashCommands": true
        }))
        .unwrap();
        assert_eq!(
            result
                .get("items")
                .and_then(Value::as_array)
                .and_then(|items| items.first())
                .and_then(|item| item.get("status"))
                .and_then(Value::as_str),
            Some("installed")
        );
        assert!(home.join(".codex/skills/ng-plan-create/SKILL.md").exists());
        let prompt = fs::read_to_string(home.join(".codex/prompts/ng-plan-create.md")).unwrap();
        assert!(prompt.contains("skills-linker:slash:ng-plan-create"));

        let uninstall_result = uninstall_skills(json!({
            "skillIds": [skill_id],
            "targetIds": ["codex-global"],
            "withSlashCommands": true
        }))
        .unwrap();
        assert_eq!(
            uninstall_result
                .get("items")
                .and_then(Value::as_array)
                .and_then(|items| items.first())
                .and_then(|item| item.get("status"))
                .and_then(Value::as_str),
            Some("uninstalled")
        );
        assert!(!home.join(".codex/skills/ng-plan-create/SKILL.md").exists());
        assert!(!home.join(".codex/prompts/ng-plan-create.md").exists());

        restore_home(old_home);
        fs::remove_dir_all(home).unwrap();
    }

    #[test]
    fn installs_local_skill_to_temp_amp_home() {
        let _guard = ENV_LOCK.lock().unwrap();
        let old_home = env::var_os("HOME");
        let home = temp_dir("skills-manager-desktop-home");
        fs::create_dir_all(&home).unwrap();
        unsafe {
            env::set_var("HOME", &home);
        }

        let skill_id = encode_skill_id("local:workspace", "auto/in-english/SKILL.md");
        let result = install_skills(json!({
            "skillIds": [skill_id.clone()],
            "targetIds": ["amp-global"],
            "mode": "copy",
            "conflictPolicy": "fail"
        }))
        .unwrap();
        assert_eq!(
            result
                .get("items")
                .and_then(Value::as_array)
                .and_then(|items| items.first())
                .and_then(|item| item.get("status"))
                .and_then(Value::as_str),
            Some("installed")
        );
        assert!(home.join(".agents/skills/in-english/SKILL.md").exists());

        let status = get_install_status(json!({ "skillIds": [skill_id] })).unwrap();
        assert_eq!(
            status
                .as_array()
                .unwrap()
                .iter()
                .find(|item| item.get("targetId").and_then(Value::as_str) == Some("amp-global"))
                .and_then(|item| item.get("installed"))
                .and_then(Value::as_bool),
            Some(true)
        );

        restore_home(old_home);
        fs::remove_dir_all(home).unwrap();
    }

    #[test]
    fn install_targets_exclude_chatgpt_aliases() {
        let targets = list_install_targets();
        let target_ids: Vec<&str> = targets
            .as_array()
            .unwrap()
            .iter()
            .filter_map(|target| target.get("id").and_then(Value::as_str))
            .collect();
        assert!(!target_ids.iter().any(|id| id.starts_with("chatgpt")));
        assert!(target_ids.contains(&"codex-global"));
        assert!(target_ids.contains(&"claude-code-global"));
        assert!(target_ids.contains(&"amp-global"));
    }

    #[test]
    fn exposes_project_install_targets() {
        let targets = list_install_targets();
        let target_ids: Vec<&str> = targets
            .as_array()
            .unwrap()
            .iter()
            .filter_map(|target| target.get("id").and_then(Value::as_str))
            .collect();
        assert!(target_ids.contains(&"codex-project"));
        assert!(target_ids.contains(&"claude-code-project"));
        assert!(target_ids.contains(&"amp-project"));

        let codex_project = targets
            .as_array()
            .unwrap()
            .iter()
            .find(|target| target.get("id").and_then(Value::as_str) == Some("codex-project"))
            .unwrap();
        assert_eq!(
            codex_project.get("skillsDir").and_then(Value::as_str),
            Some(
                repo_root()
                    .join(".codex/skills")
                    .to_string_lossy()
                    .to_string()
            )
            .as_deref()
        );
    }

    #[test]
    fn removes_imported_repository_metadata_and_cache() {
        let _guard = ENV_LOCK.lock().unwrap();
        let old_data_dir = env::var_os("SKILLS_MANAGER_DATA_DIR");
        let data_dir = temp_dir("skills-manager-desktop-data");
        let repo_cache = data_dir.join("repos").join("acme--skills");
        fs::create_dir_all(repo_cache.join("demo")).unwrap();
        fs::write(repo_cache.join("demo/SKILL.md"), "# Demo\n").unwrap();
        unsafe {
            env::set_var("SKILLS_MANAGER_DATA_DIR", &data_dir);
        }
        save_library(&json!({
            "version": 1,
            "repositories": [{
                "id": "github:acme/skills",
                "name": "acme/skills",
                "url": "https://github.com/acme/skills",
                "slug": "acme--skills",
                "path": repo_cache.to_string_lossy()
            }]
        }))
        .unwrap();

        let removed = remove_repository(json!({ "repositoryId": "github:acme/skills" })).unwrap();
        assert!(!repo_cache.exists());
        assert_eq!(
            removed
                .get("groups")
                .and_then(Value::as_array)
                .unwrap()
                .iter()
                .any(|group| group.get("id").and_then(Value::as_str) == Some("github:acme/skills")),
            false
        );
        let library = load_library().unwrap();
        assert_eq!(
            library
                .get("repositories")
                .and_then(Value::as_array)
                .map(Vec::len),
            Some(0)
        );

        restore_data_dir(old_data_dir);
        fs::remove_dir_all(data_dir).unwrap();
    }

    #[test]
    fn imports_and_refreshes_repository_through_git_cache() {
        let _guard = ENV_LOCK.lock().unwrap();
        let old_data_dir = env::var_os("SKILLS_MANAGER_DATA_DIR");
        let old_path = env::var_os("PATH");
        let old_fake_git_log = env::var_os("FAKE_GIT_LOG");
        let data_dir = temp_dir("skills-manager-desktop-data");
        let git_log = data_dir.join("git.log");
        fs::create_dir_all(&data_dir).unwrap();
        install_fake_git(&data_dir, &git_log);
        unsafe {
            env::set_var("SKILLS_MANAGER_DATA_DIR", &data_dir);
            env::set_var("FAKE_GIT_LOG", &git_log);
            env::set_var(
                "PATH",
                format!(
                    "{}:{}",
                    data_dir.join("bin").to_string_lossy(),
                    old_path
                        .as_ref()
                        .map(|value| value.to_string_lossy())
                        .unwrap_or_default()
                ),
            );
        }

        let imported =
            import_repository(json!({ "url": "https://github.com/acme/skills" })).unwrap();
        assert!(imported
            .get("groups")
            .and_then(Value::as_array)
            .unwrap()
            .iter()
            .any(
                |group| group.get("id").and_then(Value::as_str) == Some("github:acme/skills")
                    && group.get("skillCount").and_then(Value::as_u64) == Some(1)
            ));
        assert!(
            imported
                .get("skills")
                .and_then(Value::as_array)
                .unwrap()
                .iter()
                .any(|skill| skill.get("title").and_then(Value::as_str)
                    == Some("Desktop Cache Skill"))
        );

        let refreshed = refresh_repositories().unwrap();
        assert!(refreshed
            .get("skills")
            .and_then(Value::as_array)
            .unwrap()
            .iter()
            .any(|skill| skill.get("title").and_then(Value::as_str)
                == Some("Desktop Cache Skill Refreshed")));

        let removed = remove_repository(json!({ "repositoryId": "github:acme/skills" })).unwrap();
        assert!(!data_dir.join("repos/acme--skills").exists());
        assert!(!removed
            .get("groups")
            .and_then(Value::as_array)
            .unwrap()
            .iter()
            .any(|group| group.get("id").and_then(Value::as_str) == Some("github:acme/skills")));

        let log = fs::read_to_string(&git_log).unwrap();
        assert!(log.contains("clone --depth 1 https://github.com/acme/skills.git"));
        assert!(log.contains("pull --ff-only"));

        restore_data_dir(old_data_dir);
        restore_path(old_path);
        restore_fake_git_log(old_fake_git_log);
        fs::remove_dir_all(data_dir).unwrap();
    }

    #[test]
    fn desktop_translation_requires_configured_openai_key() {
        let _guard = ENV_LOCK.lock().unwrap();
        let old_key = env::var_os("OPENAI_API_KEY");
        let old_data_dir = env::var_os("SKILLS_MANAGER_DATA_DIR");
        let data_dir = temp_dir("skills-manager-desktop-config");
        fs::create_dir_all(&data_dir).unwrap();
        unsafe {
            env::remove_var("OPENAI_API_KEY");
            env::set_var("SKILLS_MANAGER_DATA_DIR", &data_dir);
        }

        let skill_id = encode_skill_id("local:workspace", "auto/in-english/SKILL.md");
        let error = translate_skill(json!({
            "skillId": skill_id,
            "targetLanguage": "Chinese"
        }))
        .unwrap_err();
        assert!(error.contains("OPENAI_API_KEY"));

        restore_openai_key(old_key);
        restore_data_dir(old_data_dir);
        fs::remove_dir_all(data_dir).unwrap();
    }

    #[test]
    fn desktop_translation_validates_request_before_provider_config() {
        let _guard = ENV_LOCK.lock().unwrap();
        let old_key = env::var_os("OPENAI_API_KEY");
        unsafe {
            env::remove_var("OPENAI_API_KEY");
        }

        let skill_id = encode_skill_id("local:workspace", "auto/in-english/SKILL.md");
        let missing_target = translate_skill(json!({
            "skillId": skill_id,
            "targetLanguage": "   ",
            "providerId": "openai"
        }))
        .unwrap_err();
        assert_eq!(missing_target, "Missing target language.");

        let unsupported_provider = translate_skill(json!({
            "skillId": encode_skill_id("local:workspace", "auto/in-english/SKILL.md"),
            "targetLanguage": "Chinese",
            "providerId": "missing-provider"
        }))
        .unwrap_err();
        assert_eq!(
            unsupported_provider,
            "Unsupported translation provider: missing-provider"
        );

        restore_openai_key(old_key);
    }

    #[test]
    fn desktop_translation_provider_can_be_configured_locally() {
        let _guard = ENV_LOCK.lock().unwrap();
        let old_key = env::var_os("OPENAI_API_KEY");
        let old_openrouter_key = env::var_os("OPENROUTER_API_KEY");
        let old_model = env::var_os("SKILLS_MANAGER_OPENAI_MODEL");
        let old_openrouter_model = env::var_os("SKILLS_MANAGER_OPENROUTER_MODEL");
        let old_data_dir = env::var_os("SKILLS_MANAGER_DATA_DIR");
        let data_dir = temp_dir("skills-manager-desktop-config");
        fs::create_dir_all(&data_dir).unwrap();
        unsafe {
            env::remove_var("OPENAI_API_KEY");
            env::remove_var("OPENROUTER_API_KEY");
            env::remove_var("SKILLS_MANAGER_OPENAI_MODEL");
            env::remove_var("SKILLS_MANAGER_OPENROUTER_MODEL");
            env::set_var("SKILLS_MANAGER_DATA_DIR", &data_dir);
        }

        let providers = list_translation_providers();
        let provider_ids: Vec<&str> = providers
            .as_array()
            .unwrap()
            .iter()
            .filter_map(|provider| provider.get("id").and_then(Value::as_str))
            .collect();
        assert_eq!(provider_ids, vec!["openai", "openrouter", "codex", "claude-code"]);
        assert_eq!(
            providers
                .as_array()
                .unwrap()
                .first()
                .and_then(|provider| provider.get("configured"))
                .and_then(Value::as_bool),
            Some(false)
        );

        let saved = save_translation_provider_config(json!({
            "providerId": "openai",
            "apiKey": "sk-local-test",
            "model": "gpt-test"
        }))
        .unwrap();
        assert_eq!(
            saved
                .as_array()
                .unwrap()
                .first()
                .and_then(|provider| provider.get("configured"))
                .and_then(Value::as_bool),
            Some(true)
        );
        assert_eq!(openai_api_key().unwrap(), Some("sk-local-test".to_string()));
        assert_eq!(openai_model().unwrap(), "gpt-test");

        save_translation_provider_config(json!({
            "providerId": "openrouter",
            "apiKey": "sk-or-test",
            "model": "openai/test-model"
        }))
        .unwrap();
        assert_eq!(openrouter_api_key().unwrap(), Some("sk-or-test".to_string()));
        assert_eq!(openrouter_model().unwrap(), "openai/test-model");

        restore_openai_key(old_key);
        restore_openrouter_key(old_openrouter_key);
        restore_openai_model(old_model);
        restore_openrouter_model(old_openrouter_model);
        restore_data_dir(old_data_dir);
        fs::remove_dir_all(data_dir).unwrap();
    }

    #[test]
    fn desktop_translation_uses_local_agent_commands() {
        let _guard = ENV_LOCK.lock().unwrap();
        let old_path = env::var_os("PATH");
        let data_dir = temp_dir("skills-manager-desktop-agents");
        let log_file = data_dir.join("agents.log");
        install_fake_agent_commands(&data_dir, &log_file);
        let next_path = match &old_path {
            Some(path) => format!("{}:{}", data_dir.join("bin").display(), path.to_string_lossy()),
            None => data_dir.join("bin").display().to_string(),
        };
        unsafe {
            env::set_var("PATH", next_path);
        }

        for provider_id in ["codex", "claude-code", "amp"] {
            let result = translate_with_local_agent(provider_id, "skill-id", "Chinese", "# Hello").unwrap();
            assert_eq!(result.get("markdown").and_then(Value::as_str), Some("# 你好"));
            assert_eq!(result.get("providerId").and_then(Value::as_str), Some(provider_id));
        }

        let log = fs::read_to_string(&log_file).unwrap();
        assert!(log.contains(
            "codex\texec --skip-git-repo-check --ignore-rules -c model_reasoning_effort=\"low\" --sandbox read-only --ephemeral --output-last-message"
        ));
        assert!(log.contains("claude\t-p --no-session-persistence"));
        assert!(log.contains("amp\t--no-ide --no-notifications -x"));

        restore_path(old_path);
        fs::remove_dir_all(data_dir).unwrap();
    }

    #[test]
    fn desktop_translation_explains_amp_environment_failures() {
        let paid_credits = normalize_local_agent_error(
            "amp",
            "Error: 402 {\"error\":{\"message\":\"Execute mode (amp -x) requires paid credits and cannot use Amp Free.\"}}",
        );
        assert!(paid_credits.contains("requires Amp paid credits"));
        assert!(paid_credits.contains("AMP_API_KEY"));

        let certificate =
            normalize_local_agent_error("amp", "Error: unknown certificate verification error");
        assert!(certificate.contains("certificate verification failed"));

        assert_eq!(
            normalize_local_agent_error("codex", "codex failed"),
            "codex failed"
        );
    }

    fn temp_dir(prefix: &str) -> PathBuf {
        let nanos = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_nanos();
        env::temp_dir().join(format!("{prefix}-{}-{nanos}", std::process::id()))
    }

    fn install_fake_git(data_dir: &Path, git_log: &Path) {
        let bin_dir = data_dir.join("bin");
        fs::create_dir_all(&bin_dir).unwrap();
        let git_path = bin_dir.join("git");
        fs::write(
            &git_path,
            format!(
                r#"#!/usr/bin/env bash
set -euo pipefail
printf '%s\t%s\n' "$(pwd)" "$*" >> "{}"
case "$1" in
  clone)
    target="${{@: -1}}"
    mkdir -p "$target/.git" "$target/skills/cache"
    cat > "$target/SKILL.md" <<'SKILL'
# Desktop Root Skill

Imported from the repository root through fake git clone.
SKILL
    cat > "$target/skill.yaml" <<'YAML'
id: desktop-root-skill
summary: desktop root fixture
YAML
    cat > "$target/skills/cache/SKILL.md" <<'SKILL'
---
name: desktop-cache-skill
description: Imported through fake git clone.
---
# Desktop Cache Skill

Imported through desktop cache.
SKILL
    ;;
  pull)
    mkdir -p "$(pwd)/skills/cache"
    cat > "$(pwd)/skills/cache/SKILL.md" <<'SKILL'
---
name: desktop-cache-skill
description: Refreshed through fake git pull.
---
# Desktop Cache Skill Refreshed

Refreshed through desktop cache.
SKILL
    ;;
  *)
    echo "unexpected fake git command: $*" >&2
    exit 2
    ;;
esac
"#,
                git_log.display()
            ),
        )
        .unwrap();
        #[cfg(unix)]
        {
            use std::os::unix::fs::PermissionsExt;
            let mut permissions = fs::metadata(&git_path).unwrap().permissions();
            permissions.set_mode(0o755);
            fs::set_permissions(&git_path, permissions).unwrap();
        }
    }

    fn install_fake_agent_commands(data_dir: &Path, log_file: &Path) {
        let bin_dir = data_dir.join("bin");
        fs::create_dir_all(&bin_dir).unwrap();
        for command_name in ["codex", "claude", "amp"] {
            let command_path = bin_dir.join(command_name);
            fs::write(
                &command_path,
                format!(
                    r#"#!/bin/sh
printf '%s\t%s\n' "${{0##*/}}" "$*" >> "{}"
printf '# 你好\n'
"#,
                    log_file.display()
                ),
            )
            .unwrap();
            #[cfg(unix)]
            {
                use std::os::unix::fs::PermissionsExt;
                let mut permissions = fs::metadata(&command_path).unwrap().permissions();
                permissions.set_mode(0o755);
                fs::set_permissions(&command_path, permissions).unwrap();
            }
        }
    }

    fn restore_home(value: Option<std::ffi::OsString>) {
        unsafe {
            if let Some(value) = value {
                env::set_var("HOME", value);
            } else {
                env::remove_var("HOME");
            }
        }
    }

    fn restore_openai_key(value: Option<std::ffi::OsString>) {
        unsafe {
            if let Some(value) = value {
                env::set_var("OPENAI_API_KEY", value);
            } else {
                env::remove_var("OPENAI_API_KEY");
            }
        }
    }

    fn restore_openrouter_key(value: Option<std::ffi::OsString>) {
        unsafe {
            if let Some(value) = value {
                env::set_var("OPENROUTER_API_KEY", value);
            } else {
                env::remove_var("OPENROUTER_API_KEY");
            }
        }
    }

    fn restore_openai_model(value: Option<std::ffi::OsString>) {
        unsafe {
            if let Some(value) = value {
                env::set_var("SKILLS_MANAGER_OPENAI_MODEL", value);
            } else {
                env::remove_var("SKILLS_MANAGER_OPENAI_MODEL");
            }
        }
    }

    fn restore_openrouter_model(value: Option<std::ffi::OsString>) {
        unsafe {
            if let Some(value) = value {
                env::set_var("SKILLS_MANAGER_OPENROUTER_MODEL", value);
            } else {
                env::remove_var("SKILLS_MANAGER_OPENROUTER_MODEL");
            }
        }
    }

    fn restore_data_dir(value: Option<std::ffi::OsString>) {
        unsafe {
            if let Some(value) = value {
                env::set_var("SKILLS_MANAGER_DATA_DIR", value);
            } else {
                env::remove_var("SKILLS_MANAGER_DATA_DIR");
            }
        }
    }

    fn restore_path(value: Option<std::ffi::OsString>) {
        unsafe {
            if let Some(value) = value {
                env::set_var("PATH", value);
            } else {
                env::remove_var("PATH");
            }
        }
    }

    fn restore_fake_git_log(value: Option<std::ffi::OsString>) {
        unsafe {
            if let Some(value) = value {
                env::set_var("FAKE_GIT_LOG", value);
            } else {
                env::remove_var("FAKE_GIT_LOG");
            }
        }
    }
}
