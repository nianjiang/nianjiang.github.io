## A blog by Hugo-book

> This is a blog for recording my learning for Cloud Native/CNCF (k8s/Istio/...)

### Commands

#### Run

hugo server --minify

#### Init

```
hugo mod init github.com/repo/path
```

Navigate to your hugo project root and add [module] section to your `config.yaml`:

```yaml
module:
  imports:
    - path: github.com/alex-shpak/hugo-book
```

Then, to load/update the theme module and run hugo:

```sh
hugo mod get -u
hugo server --minify
```



[My Gitee page](https://jnh.gitee.io/), [Update](https://gitee.com/jnh/jnh/pages)

[My Github page](https://nianjiang.github.io/)

### Resource

[Hugo book](https://github.com/alex-shpak/hugo-book)

[Tags](https://gist.github.com/rxaviers/7360908)

---------------------

### Reference

[Hugo](https://gohugo.io/)

[Golang](https://go.dev/)