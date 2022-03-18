---
title: Just some handy file movement bash scripts
subtitle: Just putting them out there so people can reuse
date: 2022-03-18T00:09:04.225Z
summary: I just can't remember them so i am putting them online
draft: false
featured: true
authors:
  - admin
lastmod: 2022-03-18T00:09:04.225Z
tags:
  - Bash
categories:
  - Fun
  - Scripts
projects: []
image:
  caption: ""
  focal_point: ""
  placement: 2
  preview_only: false
---

## File Movement

```bash
mv  -v ~/Downloads/* ~/Videos/
```

It will move all the files and folders from Downloads folder to Videos folder.

To move all files, but not folders:

If you are interested in moving all files (but not folders) from Downloads folder to Videos folder, use this command
```bash
find ~/Downloads/ -type f -print0 | xargs -0 mv -t ~/Videos
```

To move only files from the Download folders, but not from sub-folders:

If you want to move all files from the Downloads folder, but not any files within folders in the Download folder, use this command:
```bash
find ~/Downloads/ -maxdepth 1 -type f -print0 | xargs -0 mv -t ~/Videos
```
here, -maxdepth option specifies how deep find should try, 1 means, only the directory specified in the find command. You can try using 2, 3 also to test.