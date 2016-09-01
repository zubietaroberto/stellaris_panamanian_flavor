
/*
    This mapping defines how each namelist is assigned to each name 
    category. Several namelists can add to each category. Several 
    categories can share a namelist.

    attributes for each object:
    path: filename
    name: name category
    prefix: (optional) adds a string before each name inside this category
*/

module.exports = [
  {
    path:'neighborhoods.txt',
    name:'ship_corvettes'
  },
  {
    path:'streets.txt',
    name:'ship_destroyers'
  },
  {
    path:'rivers.txt',
    name:'ship_cruiser',
  },
  {
    path:'mountains.txt',
    name:'ship_cruiser',
  },
  {
    path:'artists.txt',
    name:'ship_science',
  },
  {
    path:'sports.txt',
    name:'ship_constructors',
  },
  {
    path:'colonial.txt',
    name:'ship_generic',
  },
  {
    path:'music.txt',
    name:'ship_colony',
  },
  {
    path:'vip_historical.txt',
    name:'ship_battleship',
  },
  {
    path:'herrera.txt',
    name:'planet_desert',
  },
  {
    path:'los_santos.txt',
    name:'planet_arid',
  },
  {
    path:'chiriqui.txt',
    name:'planet_tundra',
  },
  {
    path:'fauna.txt',
    name:'fort',
  },
  {
    path:'martyrs_january_9.txt',
    name:'outpost',
  },
  {
    path:'mountain_towns.txt',
    name:'planet_arctic',
  },
  {
    path:'islands.txt',
    name:'planet_ocean',
  },
  {
    path:'beaches.txt',
    name:'planet_tropical',
  },
  {
    path:'towns_other.txt',
    name:'planet_continental',
  },
  {
    path:'panama_canal.txt',
    name:'planet_gaia',
  },

  {
    path:'archeology.txt',
    name:'planet_tomb',
  },
  {
    path:'filler_planets.txt',
    name:'planet_generic',
  },
  {
    path:'province_capitals.txt',
    name:'planet_generic',
  },
  {
    path:'panama_canal_zone.txt',
    name:'transport',
  },

  {
    path:'names_male.txt',
    name:'names_male',
  },
  {
    path:'names_female.txt',
    name:'names_female',
  },
  {
    path:'surnames.txt',
    name:'surnames',
  },
  {
    path:'regnal_male.txt',
    name:'regnal_male',
  },
  {
    path:'regnal_female.txt',
    name:'regnal_female',
  },
  {
    path:'regnal_surnames.txt',
    name:'regnal_surnames',
  },
  {
    path:'football_teams.txt',
    name:'fleet',
    prefix:'Constelación'
  },
]