import os
from PIL import Image

ASSETS_DIR = r'c:\Users\jbajc\Documents\vending\vending-app\assets'
MAX_SIZE = (300, 300)
EXCLUDED_FILES = {
    'adaptive-icon.png', 'favicon.png', 'icon.png', 'splash-icon.png',
    'map-pin.png', 'map-pin-black.png', 'vending-machine.png',
    'cat-drink.png', 'cat-snack.png', 'cat-candy.png', 'cat-health.png'
}

def resize_images():
    count = 0
    saved_space = 0
    
    for filename in os.listdir(ASSETS_DIR):
        if filename in EXCLUDED_FILES:
            print(f"Skipping excluded file: {filename}")
            continue
            
        if filename.lower().endswith(('.png', '.jpg', '.jpeg')):
            filepath = os.path.join(ASSETS_DIR, filename)
            try:
                with Image.open(filepath) as img:
                    # Check dimensions
                    if img.width > 300 or img.height > 300:
                        original_size = os.path.getsize(filepath)
                        
                        # Resize maintaining aspect ratio
                        img.thumbnail(MAX_SIZE, Image.Resampling.LANCZOS)
                        
                        # Save back to same path
                        img.save(filepath, optimize=True, quality=85)
                        
                        new_size = os.path.getsize(filepath)
                        saved = original_size - new_size
                        saved_space += saved
                        count += 1
                        print(f"Resized {filename}: {original_size/1024:.1f}KB -> {new_size/1024:.1f}KB")
                    else:
                        print(f"Skipping {filename} (Size: {img.width}x{img.height})")
            except Exception as e:
                print(f"Error processing {filename}: {e}")

    print(f"\nCompleted. Resized {count} images.")
    print(f"Total space saved: {saved_space/1024/1024:.2f} MB")

if __name__ == "__main__":
    resize_images()
