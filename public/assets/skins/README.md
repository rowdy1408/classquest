# ClassQuest character skins

Student avatars load from the teacher's custom pack in `public/assets/skins/<role>/`.

## Active naming convention

- Base male: `warrior.webp`
- Base female: `warrior-female.webp`
- Upgraded male: `warrior-bronze.webp`, `warrior-gold.webp`, `warrior-crystal.webp`, `warrior-divine.webp`
- Upgraded female: `warrior-bronze-female.webp`, `warrior-gold-female.webp`, `warrior-crystal-female.webp`, `warrior-divine-female.webp`

Replace `warrior` with `mage`, `cleric`, `explorer`, `guardian`, or `bard` for the other classes.

The app keeps 40 levels and automatically upgrades armour at levels 10, 20, 30, and 40. It also accepts legacy PNG names, Vietnamese role labels, and numeric RPG class IDs. WebP is preferred to keep the deployed site lightweight.
