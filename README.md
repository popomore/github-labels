# Github Labels

Add github labels automatically.

It's very useful that init all your custom labels when create a repo.

---

## Install

```
$ npm install github-labels -g
```

## Usage

```
$ labels -c path/to/conf.json user/repo
```

About config file, see [my conf](https://gist.github.com/popomore/8ef8ad0573c97081da22dca1cc84173e) for example.

```
[
  {"name": "bug", "color": "ffffff"},
  {"name": "feature", "color": "000000"}
]
```

Your can simplify it that will generate github default color automatically.

```
["bug", "feature"]
```

Force option will delete all existing labels, otherwise will create label when not exist or update label when existing label has different color.

```
$ labels -c path/to/conf.json -f user/repo
```

## GitHub Entreprise configuration

If you're using a private GitHub, you'll need to pass some additional parameters to target your environment
* `host` - The hostname of your GHE instance.
* `pathPrefix` - The path to the API. Frequently for GHE this will be `/api/v3`.

```
$ labels -c path/to/conf.json -h github.myhost.com -p /api/v3 user/repo
```

You can also provide the OAuth token to be used directly via the `--token` parameter. 
This is useful when your GHE environment does not allow user/pass login.

```
$ labels -c path/to/conf.json -h github.myhost.com -p /api/v3 -t PERSONAL_TOKEN_123 user/repo
```

### Export from GitHub website

Here is a snippet to be able to export github labels from the labels page of a project

[gist.github.com/MoOx/93c2853fee760f42d97f](https://gist.github.com/MoOx/93c2853fee760f42d97f)

Running this code in your browser console should output your some json ready to be imported.

## License

MIT
