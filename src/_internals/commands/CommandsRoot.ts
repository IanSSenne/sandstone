import type { AtLeastOne, LiteralUnion } from '@/generalTypes'
import type {
  BIOMES,
  BLOCKS,
  Coordinates,
  ENTITY_TYPES,
  GAMEMODES,
  GAMERULES,
  ITEMS,
  JsonTextComponent,
  MessageOrSelector,
  MultipleEntitiesArgument,
  MultiplePlayersArgument,
  NBT,
  Rotation,
  SingleEntityArgument,
  SinglePlayerArgument,
  SOUND_EVENTS,
  SOUND_SOURCES,
  STRUCTURES,
} from '@arguments'
import { nbtParser } from '@variables'
import type Datapack from '@datapack/Datapack'
import type { CommandArgs } from '@datapack/minecraft'
import { JsonTextComponentClass } from '@variables/JsonTextComponentClass'
import util from 'util'
import { coordinatesParser, rotationParser } from '..'
import type * as commands from '../../commands'
import { command } from './decorators'
import {
  AdvancementCommand, Attribute, Bossbar, Clone, Data, DatapackCommand, Debug,
  DefaultGamemode, Difficulty, Effect, Enchant,
  ExecuteWithRun,
  Experience,
  Fill,
  Forceload,
  FunctionCommand, GameruleCommand, Loot, Particle, RecipeCommand, ReplaceItem, Schedule, Scoreboard, SpreadPlayers, TagCommand, Team, Teleport, Time, Title, Trigger, Weather, WorldBorder,
} from './implementations'

export class CommandsRoot {
  Datapack: Datapack

  inExecute: boolean

  executable: boolean

  arguments: CommandArgs

  // This might seem weird, but we need this object to reference itself.
  // Thanks to that, CommandsRoot implements the Command interface,
  // and we can directly create commands here.
  commandsRoot: CommandsRoot

  constructor(datapack: Datapack) {
    this.arguments = []
    this.inExecute = false
    this.executable = false
    this.Datapack = datapack
    this.commandsRoot = this
  }

  /**
   * Registers the current command.
   *
   * @param soft If true, then it allows to try to register a command when we don't know if it is needed.
   * Sometimes, is is possible a command needs to be registered, or maybe it's not. Then a soft register is necessary.
   */
  register = (soft = false) => {
    if (this.executable) {
      // We remove undefined arguments!
      this.Datapack.registerNewCommand(this.arguments.filter((arg) => arg !== undefined) as CommandArgs)
      this.reset()
      return
    }

    if (!soft) {
      throw new Error(`Registering a command that is not executable: ${this.arguments.join(' ')}`)
    }

    // Soft registering. If the last command had arguments but was not executable, it's an error.
    if (this.arguments.length > 0) {
      throw new Error(`Error: the previous command ${this.arguments} was not finished.`)
    }
  }

  /**
   * Add some arguments to the current ones, then registers them.
   * It will explicitely set the resulting command as executable.
   */
  addAndRegister = (...args: CommandArgs) => {
    this.arguments.push(...args)
    this.executable = true
    this.register()
  }

  reset() {
    this.arguments = []
    this.inExecute = false
    this.executable = false
  }

  /** COMMANDS */
  // advancement command //
  advancement = new AdvancementCommand(this)

  // attribute command //
  attribute = (new Attribute(this)).attribute

  // bossabar command //
  bossbar = new Bossbar(this)

  /**
   * Clears items from player inventory, including items being dragged by the player.
   *
   * @param targets Specifies the player(s) whose items are cleared.
   * If not specified, defaults to the player who executes the command.
   *
   * @param item Specifies the item to be cleared. If not specified, all items are cleared.
   *
   * @param maxCount Specifies the maximum number of items to be cleared.
   *
   * If not specified, all items that match `item` are cleared.
   *
   * If `0`, instead of clearing of items, detectes and queries the amount of specified items.
   */
  @command('clear', { isRoot: true })
  clear = (targets?: MultiplePlayersArgument, item?: LiteralUnion<ITEMS>, maxCount?: number) => { }

  // clone command //
  clone = (new Clone(this)).clone

  // Add a comment //
  /**
   * Adds a comment, starting with a `#`, to the function.
   */
  @command('#', { isRoot: true })
  comment = (...comments: string[]) => { }

  // data command //
  data = new Data(this)

  // datapack command //
  datapack = new DatapackCommand(this)

  // debug command //
  debug = new Debug(this)

  // defaultgamemode command //
  defaultgamemode = (new DefaultGamemode(this)).defaultgamemode

  // difficulty command //
  difficulty = (new Difficulty(this)).difficulty

  // effect command //
  effect = (new Effect(this))

  // enchant command //
  enchant = (new Enchant(this)).enchant

  // execute command //
  execute: Omit<ExecuteWithRun<CommandsRoot>, 'run' | 'runOne'> = (new ExecuteWithRun(this))

  // experience command //
  experience = new Experience(this)

  // fill command //
  fill = (new Fill(this)).fill

  // forceload command //
  forceload = new Forceload(this)

  // function command //
  functionCmd = (new FunctionCommand(this).function)

  /**
   * Sets a player's game mode.
   *
   * @param gamemode Specifies the new game mode. Must be one of the following:
   * - `survival` for survival mode
   * - `creative` for creative mode
   * - `adventure` for adventure mode
   * - `spectator` for spectator mode‌
   *
   * @param targets Specifies the target(s). If not specified, defaults to the player who executes the command.
   */
  @command('gamemode', { isRoot: true })
  gamemode = (gamemode: GAMEMODES, targets?: MultiplePlayersArgument) => { }

  // gamerule command //
  gamerule = (new GameruleCommand(this)).gamerule

  /**
   * Gives an item to one or more players.
   *
   * @param targets Specifies the target(s) to give item(s) to.
   *
   * @param item Specifies the item to give.
   *
   * @param count Specifies the number of items to give. If not specified, defaults to `1`.
   */
  @command('give', { isRoot: true })
  give = (targets: MultiplePlayersArgument, item: LiteralUnion<ITEMS>, count?: number) => { }

  /**
   * Shows usages for one command, or lists of commands.
   *
   * @param command_ Specifies the command name to provide help for.
   * Entering more specific parameters of that command is allowed.
   *
   * If unspecified, lists all commands.
   *
   * @param parameters More specific parameters of the command.
   */
  @command('help', { isRoot: true })
  help = (command_?: LiteralUnion<keyof typeof commands>, ...parameters: string[]) => { }

  // kill command //
  /**
   * Kills entities (players, mobs, items, etc.).
   *
   * @param targets Specifies the target(s) to kill. If not specified, defaults to the executor who executed the command.
   */
  @command('kill', { isRoot: true })
  kill = (targets?: MultipleEntitiesArgument) => { }

  // list command //
  /**
   * Shows the names of all currently-connected players.
   *
   * @param uuid Whether to show player UUIDs alongside names. Defaults to false.
   */
  @command('list', {
    isRoot: true,
    parsers: {
      '0': (uuids) => (uuids ? 'uuids' : undefined),
    },
  })
  list = (uuids?: boolean) => { }

  // locate command //
  /**
   * Displays the coordinates for the closest generated structure of a given type in the chat for the player who executed the command.
   *
   * @param structure Specifies the structure to locate.
   */
  @command('locate', { isRoot: true })
  locate = (structure: LiteralUnion<STRUCTURES>) => { }

  // locatebiome command //
  /**
   * Displays the coordinates for the closest biome of a given biome ID in the chat for the player who executed the command.
   *
   * @param biome Specifies the biome to be located.
   */
  @command('locatebiome', { isRoot: true })
  locatebiome = (biome: LiteralUnion<BIOMES>) => { }

  // loot command //
  loot = new Loot(this)

  // me command //
  /**
   * Displays a message about yourself.
   *
   * @param actions Specifies the messages to display. They will be joined with a whitespace.
   *
   * Each action can be a message or a selector.
   * The game replaces entity selectors in the message with the list of selected entities' names,
   * which is formatted as "name1 and name2" for two entities, or "name1, name2, ... and namen" for n entities.
   */
  @command('me', { isRoot: true })
  me = (...actions: string[]) => { }

  // particle command //
  particle = (new Particle(this)).particle

  // playsound command //
  /**
   * Plays a specified sound at a player, in a location, and in a specific volume and pitch.
   *
   * @param sound Specifies the sound to play.
   *
   * A sound event may be affiliated with multiple sounds, and the sound that is actually produced is chosen at random from them,
   * modified by their "weight", just as the game normally would.
   * For example, the `entity.pig.ambient` sound event plays one of several pig sounds at random,
   * because the event has multiple sounds associated with it.
   *
   * Resource packs may add their own events to `sounds.json`; the command successfully plays these.
   * File names are not used by this command; it strictly uses the events defined in `sounds.json`
   * (which may not even be similar to the original file names and paths),
   * and thus a resource pack adding new sound files must define events for them
   * (this is not necessary when replacing old sounds already defined in events).
   *
   * @param source Specifies the music category and options the sound falls under.
   *
   * @param targets Specifies the sound's target.
   */
  @command('playsound', { isRoot: true })
  playsound = (sound: LiteralUnion<SOUND_EVENTS>, source: SOUND_SOURCES, targets: MultiplePlayersArgument, sourcePosition?: Coordinates, volume?: number, pitch?: number, minVolume?: number) => { }

  // recipe command //
  recipe = new RecipeCommand(this)

  // reload command //
  /**
   * Reloads the current data packs.
   *
   * If a data pack has invalid data (such as an invalid recipe format),
   * changes are not applied and the game continues using the previous data.[
   */
  @command('reload', { isRoot: true })
  reload = () => { }

  /**
   * A raw command. Can be used to create custom commands, for mods or plugins for example.
   *
   * @example
   * // A custom `mount` command, that takes a player and an entity as argument
   * const self = Selector(`@s`)
   * const nearestSkeleton = Selector(`@e`, { limit: 1, sort: 'nearest' })
   *
   * raw('mount', self, nearestSkeleton)
   */
  @command([], { isRoot: true })
  raw = (...args: unknown[]) => {}

  // replaceitem command //
  replaceitem = new ReplaceItem(this)

  // say command //
  /**
   * Sends a message in the chat.
   *
   * @param messages Specifies the messages to say.
   * All messages will be joined with a whitespace.
   *
   * Each message must be a plain text, or a target selectors.
   * The game replaces entity selectors in the message with the list of selected entities' names, which is formatted as "name1 and name2" for two entities,
   * or "name1, name2, ... and namen" for n entities.
   */
  @command('say', { isRoot: true })
  say = (...messages: MessageOrSelector[]) => { }

  // schedule command //
  schedule = new Schedule(this)

  // scoreboard command //
  scoreboard = new Scoreboard(this)

  // seed command //
  /** Displays the world seed. */
  @command('seed', { isRoot: true })
  seed = () => { }

  // setblock command //
  /**
   * Changes a block to another block.
   *
   * @param pos Specifies the position of the block to be changed.
   *
   * @param block Specifies the new block.
   *
   * @param type Specifies how to handle the block change. Must be one of:
   * - `destroy`: The old block drops both itself and its contents (as if destroyed by a player). Plays the appropriate block breaking noise.
   * - `keep`: Only air blocks are changed (non-air blocks are unchanged).
   * - `replace`: The old block drops neither itself nor any contents. Plays no sound.
   *
   * If not specified, defaults to `replace`.
   */
  @command('setblock', { isRoot: true, parsers: { '0': coordinatesParser } })
  setblock = (pos: Coordinates, block: LiteralUnion<BLOCKS>, type?: 'destroy' | 'keep' | 'replace') => { }

  // setidletimeout command //
  /**
   * Sets the time before idle players are kicked from the server.
   *
   * @param minutes Specifies the idle kick timer.
   */
  @command('setidletimeout', { isRoot: true })
  setidletimeout = (minutes: number) => { }

  // setworldspawn command //
  /**
   * Sets the world spawn.
   *
   * @param pos Specifies the coordinates of the world spawn. If not specified, defaults to the block position of the command's execution.
   *
   * @param angle Specified the yaw angle to spawn with. Defaults to the direction the executor is facing.
   */
  @command('setworldspawn', { isRoot: true, parsers: { '0': coordinatesParser, '1': rotationParser } })
  setworldspawn = (pos?: Coordinates, angle?: Rotation) => { }

  // spawnpoint command //
  /**
   * Sets the spawn point for a player. You can now set your spawnpoint in the Nether and End.
   *
   * @param targets Specifies the player whose spawn point should be set.
   * If not specified, defaults to the command's executor.
   *
   * @param pos Specifies the coordinates of the player's new spawn point.
   * If not specified, defaults to the position of the command's executor in Java Edition.
   *
   * @param angle Specifies the yaw angle to spawn with. Defaults to the direction the executor is facing.
   */
  @command('spawnpoint', { isRoot: true, parsers: { '1': coordinatesParser, '2': rotationParser } })
  spawnpoint = (targets?: MultiplePlayersArgument, pos?: Coordinates, angle?: Rotation) => { }

  // spectate command //
  /**
   * Causes a player in Spectator mode to spectate another entity.
   *
   * @param targets Specifies the target to be spectated.
   *
   * @param player Specifies the spectating player. If unspecified, defaults to the executor.
   */
  @command('spectate', { isRoot: true })
  spectate = (target: SinglePlayerArgument, player?: SingleEntityArgument) => { }

  // spreadplayers command //
  spreadplayers = (new SpreadPlayers(this)).spreadplayers

  /**
   * Stops a given sound.
   *
   * @param targets Specifies the command's target.
   *
   * @param source Specifies which category in the Music & Sound options the sound falls under. If it is *, stop sound of all category.
   *
   * @param sound Specifies the sound to stop.
   */
  @command('stopsound', { isRoot: true })
  stopsound = (targets: MultiplePlayersArgument, source?: SOUND_SOURCES | '*', sound?: LiteralUnion<SOUND_EVENTS>) => { }

  /**
   * Summons an entity.
   *
   * @param entity Specifies the entity to be summoned.
   *
   * @param pos Specifies the position to summon the entity. If not specified, defaults to the position of the command's execution.
   *
   * @param nbt Specifies the data tag for the entity.
   */
  @command('summon', { isRoot: true, parsers: { '2': nbtParser } })
  summon = (entity: LiteralUnion<ENTITY_TYPES>, pos?: Coordinates, nbt?: NBT) => { }

  // tag command //
  tag = (new TagCommand(this)).tag

  // team command //
  team = new Team(this)

  // teammessage command //
  /**
   * Specifies a message to send to team.
   *
   * @param messages Must be plain text messages.
   * Can include spaces as well as target selectors.
   * The game replaces entity selectors in the message with the list of selected entities' names,
   * which is formatted as "name1 and name2" for two entities, or "name1, name2, ... and namen" for n entities.
   *
   * At least one message is necesarry.
   */
  @command('teammessage', { isRoot: true })
  teammessage = (...messages: AtLeastOne<MessageOrSelector>) => { }

  // teleport command //
  teleport = (new Teleport(this)).teleport

  // tell command //
  /**
   * Sends a private message to one or more players.
   * @param targets Specifies the player(s) to send the message to.
   * @param messages Specified the message to tell. They will be joined with whitespaces.
   * Can include target selectors.
   * The game replaces entity selectors in the message with the list of selected entities' names,
   * which is formatted as "name1 and name2" for two entities, or "name1, name2, ... and namen" for n entities.
   */
  @command('tell', { isRoot: true })
  tell = (targets: MultiplePlayersArgument, ...messages: AtLeastOne<MessageOrSelector>) => { }

  // tellraw command //
  @command('tellraw', { isRoot: true, parsers: { '1': (msg) => new JsonTextComponentClass(msg) } })
  tellraw = (targets: MultiplePlayersArgument, message: JsonTextComponent) => { }

  // time command //
  time = new Time(this)

  // title command //
  title = (new Title(this)).title

  // trigger command //
  trigger = (new Trigger(this)).trigger

  weather = new Weather(this)

  worldborder = new WorldBorder(this)

  /// ALIAS COMMANDS ///

  // msg command //
  msg: CommandsRoot['tell'] = (...args) => this.tell(...args)

  // w command //
  w: CommandsRoot['tell'] = (...args) => this.tell(...args)

  // xp command //
  xp: CommandsRoot['experience'] = this.experience
}

export default CommandsRoot
