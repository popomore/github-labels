# Github Labels

Add github labels automatically.

It's very useful when you have lots of repos and want to edit labels.

---

## Install

```
$ npm install github-labels -g
```

## Usage

```
$ labels -c path/to/conf.json user/repo
```

About config file, see [my conf](https://github.com/popomore/dotfile/blob/master/conf/labels.json) for example.

```
[
  {"name": "bug", "color": "ffffff"},
  {"name": "feature", "color": "000000"}
]
```

Your can simplify it, and will generate color automatically.

```
["bug", "feature"]
```

## Lisence

MIT
