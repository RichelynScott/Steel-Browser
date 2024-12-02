import os

def delete_zone_identifiers():
    # Get current directory
    current_dir = os.getcwd()
    
    # Find and delete all Zone.Identifier files recursively
    count = 0
    # Walk bottom-up (topdown=False) to handle nested directories properly
    for root, dirs, files in os.walk(current_dir, topdown=False):
        for filename in files:
            if filename.endswith(":Zone.Identifier"):  # Handle Windows-style Zone.Identifier files
                file_path = os.path.join(root, filename)
                try:
                    os.remove(file_path)
                    print(f"Deleted: {file_path}")
                    count += 1
                except Exception as e:
                    print(f"Error deleting {file_path}: {e}")
            elif ".Zone.Identifier" in filename:  # Handle other Zone.Identifier variations
                file_path = os.path.join(root, filename)
                try:
                    os.remove(file_path)
                    print(f"Deleted: {file_path}")
                    count += 1
                except Exception as e:
                    print(f"Error deleting {file_path}: {e}")
    
    print(f"\nTotal files deleted: {count}")

if __name__ == "__main__":
    delete_zone_identifiers() 