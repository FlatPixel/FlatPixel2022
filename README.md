### Flat Pixel Website

This website is **handmade** with simple stack (no package manager) so only HTML5, sass, css and javascript. The Sass file is compiled directly in VSCode with the _Live Sass Compiler_ extension. You can also use the VSCode Extension _Live server_ to launch a local environment. <br>
The presskit pages (company & projects) are included in sub folders.

### PressKit

The Press Kit page is done with the presskit tool from https://github.com/pixelnest/presskit.html.

_You should install presskit on your machine from npm package manager._

- Quick Start: https://github.com/pixelnest/presskit.html#quickstart-for-existing-presskit-users <br>
- Modify company presskit page: http://pixelnest.io/presskit.html/company/ <br>
- Add or modify project presskit page: http://pixelnest.io/presskit.html/product/

The command that we use to build the presskit:

- Go to ./presskit/dev/
- `presskit build --collapse-menu -o ../`
