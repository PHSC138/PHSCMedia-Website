#!/usr/bin/env python3

import argparse
from PIL import Image
import os
import re

des = '''Create js file for photos from path. Example:
./create_js.py -s public/images/longboarding/plc_board_meeting_2020 longboarding "PLC Board Meeting 2020"
if local path and server route are different: use '-r' **note 'public' and '../public' should be removed automatically**
./create_js.py -s ../public/images/longboarding/maryhill_2021_09 -r /images/longboarding/maryhill_2021_09/ longboarding "Maryhill September 2021"
'''

parser = argparse.ArgumentParser(description=des)
parser.add_argument('path', help='path to image folder, last folder will be name of js output file')
parser.add_argument('category', help='category of picture')
parser.add_argument('text', help='Name of folder to display')
parser.add_argument('-s',
                    '--sorted',
                    action='store_true',
                    help='sort folder before writing to file')
parser.add_argument('-r', '--route', nargs=1, type=str)

args = parser.parse_args()

# Add trailing / for folder
if args.path[-1] != '/':
    args.path = args.path + '/'
directory_path = args.path

# Remove public from img src
if args.path[:6] == 'public':
    args.path = args.path[6:]
if args.path[:9] == '../public':
    args.path = args.path[9:]

outfile = os.path.basename(os.path.normpath(args.path))

dict_of_files = {}

with open('../data/' + args.category + '/' + outfile + '.js', 'w') as output_file:
    output_file.write('const ' + outfile + ' = {\n  text: "' + args.text +
                      '",\n  photos: [')

    list_of_files = os.listdir(directory_path)

    # Files should be DSCxxxxx_phscmedia_size.jpg
    for file in list_of_files:
        file_tokens = file.split('_')
        # prefix will be DSCxxxxx
        prefix = file_tokens[0]

        # Old photos were SAM_xxxx
        if prefix == "SAM":
            prefix += file_tokens[1]

        if prefix not in dict_of_files:
            # Create thumbnail, modal, download dicts under prefix
            sub_dict = {"thumbnail": None, "modal": None, "download": None}
            dict_of_files[prefix] = sub_dict

        # Store different size into dict (strip the .jpg)
        size = file_tokens[-1].split('.')[0]
        if size == "480w":
            dict_of_files[prefix]["thumbnail"] = file
        elif size == "2560w":
            dict_of_files[prefix]["modal"] = file
        elif size == "download":
            dict_of_files[prefix]["download"] = file
        else:
            # Do nothing...?
            print("Not recognized size:", size, file)
#                 dict_of_files[prefix]["src"] = file


    path = args.path
    if args.route:
        path = args.route[0]

    # Group photos by sizes
    #   For loop to go through each photo **won't keep sorted property will have to loop through sorted keys
    #   Dict with the name of the photo before the space, ex: "DSC0000 thumbnail"
    #   ["DSC0000": {"thumbnail": "/images/longboarding/maryhill_2021_09/DSC0000 thumbnail.jpg"]
    #   no thumbnail / modal / download size: ["DSC0000": {"src": "/images/longboarding/maryhill_2021_09/DSC0000.jpg"]
    #       also store width and height in the dict with src / thumbnail
    #   Loop through dict and store values with thumbnail, etc
    #       {
    #           thumbnail: {
    #               src: "dsc.jpg",
    #               width: "....",
    #               height: "....",
    #           }
    #           modal: {
    #               src: "dsc.jpg",
    #               width: "....",
    #               height: "....",
    #           }
    #           download: {
    #               src: "dsc.jpg",
    #               width: "....",
    #               height: "....",
    #           }
    #       }
    #   Check for sorted and sort the keys, then loop through and add to output_file

    keys = list(dict_of_files.keys())

    # Sort keys if sorted arg exists
    if args.sorted:
        keys = sorted(keys)

    image_types = ["thumbnail", "modal", "download"]
    print(dict_of_files)
    for key in keys:
        print(key)

        output_file.write("{")

        for type in image_types:
            img = Image.open(directory_path + dict_of_files[key][type])
            width, height = img.size
            img.close()

            output_file.write("\n    " + type + ": {\n      src: \"" + path + dict_of_files[key][type] +
                "\",\n      width: " + str(width) + ",\n      height: " + str(height) + "\n    },")

        output_file.write("\n  },")

    output_file.seek(0, os.SEEK_END)
    output_file.seek(output_file.tell() - 1, os.SEEK_SET)
    output_file.write(']\n}\nmodule.exports = ' + outfile + ';')

# Check if folder has already been imported.
imported = False

# Lines of file
category_lines = None

# Create patterns
category_import_pattern = re.compile("const " + outfile + ".*;")
albums_pattern = re.compile("\s+albums: \[")

# Iterate through all lines of category file and check if file has been imported
# If it hasn't, break at the line that the albums list begins on
with open('../data/' + args.category + '.js', 'r') as category_file:
    # Read category_file lines
    category_lines = category_file.readlines()

    # Make sure we can still access 'i'
    i = 0
    for i, line in enumerate(category_lines):
        # Check if done imports
        if line[:5] == 'const':
            if category_import_pattern.match(line) is not None:
                # Import matches
                print('Import already exists in {}.js'.format(args.category))
                imported = True
                break
        else:
            # Check if start of category json
            if albums_pattern.match(line) is not None:
                break

    if not imported:
        print('Inserting "{}," after "{}" at {}, and importing file'.format(outfile, line.strip(), i))
        category_lines.insert(i + 1, "        " + outfile + ",\n")
        category_lines.insert(0, 'const ' + outfile + ' = require("./' + args.category + '/' + outfile + '");\n')

# Rewrite file with changes
with open('../data/' + args.category + '.js', 'w') as category_file:
    category_file.writelines(category_lines)
