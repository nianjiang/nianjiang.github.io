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



[My Gitee page](https://jnh.gitee.io/)

[My Github page](https://nianjiang.github.io/)

### Resource

[Hugo book](https://github.com/alex-shpak/hugo-book)

[Sample1:](https://www.yuanmoc.cn/posts/%E4%BD%BF%E7%94%A8hugo%E6%90%AD%E5%BB%BA%E5%8D%9A%E5%AE%A2/)

[Sample2:](https://coostdocs.gitee.io/cn/about/co/)

---------------------

### Reference

[Hugo](https://gohugo.io/)

[Golang](https://go.dev/)