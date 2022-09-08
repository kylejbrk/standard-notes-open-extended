import os
import zipfile
import json

def unzip_all(zip_dir, output_dir):
    for f in os.listdir(zip_dir):
        if f.endswith('.zip'):
            zip_path = os.path.join(zip_dir, f)
            output_path = os.path.join(output_dir, f.replace('.zip', ''))

            with zipfile.ZipFile(zip_path) as z:
                z.extractall(output_path)

            print(f'Output contents of {zip_path} to {output_path}')

            create_index(output_path)

def create_index(output_path):
    package_file = 'package.json'
    if package_file in os.listdir(output_path):
        package_path = os.path.join(output_path, package_file)

        with open(package_path) as f:
            package_info = json.load(f)

        index = {
            'name': package_info['name'],
            'version': package_info['version'],
            # 'description': package_info['description'],
            'url': 'http://127.0.0.1:5500/' + output_path + '/' + package_info.get('sn', {}).get('main', 'index.html')
        }
        
        with open(os.path.join(output_path, 'index.json'), 'w') as f:
            json.dump(index, f, indent = 4)
    else:
        print('no package.json')

def main():
    zip_dir = 'zips'
    output_dir = 'public'

    unzip_all(zip_dir, output_dir)

if __name__ == '__main__': 
    main()