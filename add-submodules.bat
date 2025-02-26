@echo off
echo Adding submodules...
git submodule add https://github.com/Appraisily/main_page
git submodule add https://github.com/Appraisily/art-appraiser-directory-frontend
git submodule init
git submodule update
echo Done! 