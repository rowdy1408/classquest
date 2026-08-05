# Character skins — automatic role and armour loading

Version 1.8.1 includes a visible male/female starter avatar for every role. If
an armour-specific image has not been added yet, the app now falls back to the
matching starter avatar instead of leaving an empty frame. The emoji fallback
also remains visible when every image candidate is unavailable.

The app now loads the avatar automatically from the student's:

1. **Role**: Warrior, Mage, Cleric, Explorer, Guardian or Bard
2. **Character skin**: male or female
3. **Level / armour tier**

No import statement is needed. Place the files in the matching role folder and keep the exact lowercase names below.

## Armour progression

| Level | Armour file label |
|---|---|
| 1–3 | base |
| 4–9 | iron |
| 10–15 | steel |
| 16–21 | knight |
| 22–27 | crystal |
| 28–30 | divine |

## Exact naming pattern

For a male Warrior:

```text
public/assets/skins/warrior/warrior.png
public/assets/skins/warrior/warrior-iron.png
public/assets/skins/warrior/warrior-steel.png
public/assets/skins/warrior/warrior-knight.png
public/assets/skins/warrior/warrior-crystal.png
public/assets/skins/warrior/warrior-divine.png
```

For a female Warrior:

```text
public/assets/skins/warrior/warrior-female.png
public/assets/skins/warrior/warrior-iron-female.png
public/assets/skins/warrior/warrior-steel-female.png
public/assets/skins/warrior/warrior-knight-female.png
public/assets/skins/warrior/warrior-crystal-female.png
public/assets/skins/warrior/warrior-divine-female.png
```

Use the same pattern for the other roles:

```text
mage/mage.png
mage/mage-iron.png
mage/mage-iron-female.png

cleric/cleric.png
explorer/explorer.png
guardian/guardian.png
bard/bard.png
```

PNG and WebP are both supported. The app first tries PNG, then WebP. It also checks `public/assets/skins/common/` as a fallback.

## Important

- Use lowercase role names in filenames and folder names.
- Do not add spaces.
- `warrior-knight-female.png` is correct.
- `Warrior Gold Female.png` will not be found.
- After replacing image files while Vite is running, refresh the browser with `Ctrl + F5`.
- Existing students can be updated through **Teacher → Class → Students → Edit student** to select male/female skin and change their level for testing.
