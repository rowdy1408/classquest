# Character skins

Drop your character skin files into the role folders in this directory.

```text
public/assets/skins/
├── warrior/
├── mage/
├── cleric/
├── explorer/
├── guardian/
├── bard/
└── common/
```

## Recommended file format

- PNG or WebP
- Transparent background
- Square canvas when possible
- Suggested size: 256×256, 512×512, or the original pixel-art resolution
- Use lowercase file names without spaces or Vietnamese accents

Examples:

```text
warrior/warrior-male-01.png
warrior/warrior-female-01.png
mage/mage-blue-01.webp
common/default-student.png
```

Files inside `public` are available from the root URL. For example:

```text
/assets/skins/warrior/warrior-male-01.png
```

Keep the original files here. A later skin-selector screen can read the paths listed in `skin-manifest.json`.
