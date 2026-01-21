import os
import sys
import argparse
import subprocess
import shutil
import datetime

# Ensure UTF-8 output for emojis
sys.stdout.reconfigure(encoding='utf-8')

def run_command(command, shell=True, check=True, cwd=None):
    """Run a shell command and handle errors."""
    try:
        subprocess.run(command, shell=shell, check=check, cwd=cwd)
    except subprocess.CalledProcessError as e:
        print(f"❌ Command failed: {command}")
        sys.exit(e.returncode)

def main():
    parser = argparse.ArgumentParser(description="WikiExplorer Deployment Script")
    parser.add_argument("-m", "--message", help="Specify a custom commit message.")
    parser.add_argument("--nobuild", action="store_true", help="Skip the 'npm run build' step.")
    parser.add_argument("--nopush", action="store_true", help="Skip the 'git push' step.")
    
    args = parser.parse_args()

    # Default commit message
    if not args.message:
        now = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        args.message = f"Update site and notes: {now}"

    print("🚀 Starting Deployment Workflow...")

    # 1. Sync and Build locally
    if not args.nobuild:
        print("📦 Building project (including sync)...")
        # On Windows, 'npm' often needs 'npm.cmd' or shell=True
        run_command("npm run build")
    else:
        print("⏩ Build skipped (--nobuild option used).")
        print("   Using existing 'dist/' directory.")
        if not os.path.exists("dist"):
            print("❌ Error: 'dist' directory not found! Cannot deploy without build.")
            sys.exit(1)

    # 2. Deploy and Push (Page Branch only)
    if not args.nopush:
        print("🚀 Deploying 'dist' artifact to 'page' branch...")
        
        # Copy GitHub Workflows
        print("🔧 Copying GitHub Workflows to dist...")
        src_github = ".github"
        dst_github = os.path.join("dist", ".github")
        
        if os.path.exists(dst_github):
            shutil.rmtree(dst_github)
        
        if os.path.exists(src_github):
            shutil.copytree(src_github, dst_github)
        
        # Git Operations in dist/
        dist_dir = "dist"
        
        # Initialize temp repo
        # We need to ignore errors on 'git init' if it already exists, but usually we just run it.
        # To match the batch script which does 'git init' every time (safe in existing dir):
        run_command("git init", cwd=dist_dir)
        run_command("git add -A", cwd=dist_dir)
        
        print("📝 Committing deployment...")
        # Use simple quotes for the message to avoid shell parsing issues
        run_command(f'git commit -m "{args.message}"', cwd=dist_dir)
        
        print("📤 Pushing Dist to origin/page (SSH)...")
        run_command("git push -f git@github.com:yceachan/yceachan.github.io.git HEAD:page", cwd=dist_dir)
        
        print("✨ Deployment to 'page' branch complete!")
    else:
        print("⏹️ Push skipped (--nopush option used).")
        print("   Dist generated in 'dist/'.")

    print("\nℹ️  Reminder: 'main' branch was NOT pushed.")
    print("   If you have source code changes, please push them manually.")

if __name__ == "__main__":
    main()
