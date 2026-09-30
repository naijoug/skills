fn main() {
    // Use Git's ignore rules to exclude local caches and credentials.
    let root = std::path::PathBuf::from(std::env::var("CARGO_MANIFEST_DIR").unwrap());
    let skills = root.join("../../../skills");
    println!("cargo:rerun-if-changed={}", skills.display());
    let destination = root.join("resources/skills");
    if destination.exists() {
        std::fs::remove_dir_all(&destination).unwrap();
    }
    let files = std::process::Command::new("git")
        .args([
            "ls-files",
            "--cached",
            "--others",
            "--exclude-standard",
            "-z",
            "--",
            "skills/",
        ])
        .current_dir(root.join("../../.."))
        .output()
        .expect("git is required to prepare bundled skills");
    assert!(files.status.success(), "Cannot enumerate bundled skills");
    for file in files
        .stdout
        .split(|byte| *byte == 0)
        .filter(|file| !file.is_empty())
    {
        let relative = std::path::Path::new(std::str::from_utf8(file).unwrap());
        let source = root.join("../../..").join(relative);
        if !source.exists() {
            continue;
        }
        assert!(
            !source.is_symlink(),
            "Bundled skills must not contain symlinks"
        );
        let target = destination.join(relative.strip_prefix("skills").unwrap());
        std::fs::create_dir_all(target.parent().unwrap()).unwrap();
        std::fs::copy(source, target).unwrap();
    }
    tauri_build::build()
}
