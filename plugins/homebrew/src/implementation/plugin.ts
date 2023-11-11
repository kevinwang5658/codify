import { Plugin } from "../library/entities/plugin";
import {HomebrewMainResource} from "./resources";
import {HomebrewOptionsResource} from "./resources/options";

export class HomebrewPlugin extends Plugin {
  name = 'homebrew'
  resources = [
    new HomebrewMainResource(),
    new HomebrewOptionsResource(),
  ]
}
