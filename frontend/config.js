// config.js : Put all top-level configurations here

const STARTLOCATION = [43.8457, 13.0191];
const STARTZOOM = 14;

// map constraints - use this to ensure the user doesn't float off to other places
const BOUNDS = [[27.7,75.5], [29.5,78.5]];
const MINZOOM = 10;
const MAXZOOM = 20;
const MAXBOUNDSVISCOSITY = 0.5;

const SHAPES_FOLDER = 'data/';
const LAYERS_CSV = 'config/map_layers.csv';

// to make some layers visible by default when map loads, put "Y" under "default" column for them in the CSV.
