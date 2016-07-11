Panamanian Flavor Mod - Stellaris
=======================================

![Thumbnail](/templates/thumbnail.jpg?raw=true "thumbnail")

A namelist and prescripted country for the  videogame Stellaris by Paradox
Interactive. Based on real Panamanian names , locations and culture. This way one
can play as a Panamanian flavored empire inside the game; with real Panamanaian
names, locations and characters.

Character names are fed from the [National Comptroller General](http://contraloria.gob.pa/).

This _hopelessly overengineered_ generator compiles custom namefiles into a
mod format for use directly by the game.

How to compile
----------------
1. Install [NodeJS](https://nodejs.org/) (Tested with v5 and v6)
2. Copy this repository
3. Inside the repository run the command `npm install` to install dependencies
4. Compile the files
  * On *Windows*: run the command `node index.js`
  * On *Linux*: run the comand `npm start`
5. Copy the contents of the output folder to [your local mod folder](http://www.stellariswiki.com/Modding#Mod_structure)
6. Enjoy!

How to use
-------------
* The `templates/` folder contains the base files used to create the namelist.
* The names themselves are in the folder `namelists/`. Each file is a different
category. Pound symbols(`#`) are used as comment markers.
* The `namelist_generator.js` contains the mapping between the fields and the
namelist. Several namelists can fill the names for any category.

Credits
----------
By: Roberto E. Zubieta

Panama City, Republic of Panama

http://poroto.com.pa

License
-------
MIT
