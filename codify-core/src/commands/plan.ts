import {Args, Command, Flags} from '@oclif/core'

export default class Plan extends Command {
  static args = {
    file: Args.string({description: 'file to read'}),
  }

  static description = 'describe the command here'

  static examples = [
    '<%= config.bin %> <%= command.id %>',
  ]

  static flags = {
    // flag with no value (-f, --force)
    force: Flags.boolean({char: 'f'}),
    // flag with a value (-n, --name=VALUE)
    name: Flags.string({char: 'n', description: 'name to print'}),
  }

  public async run(): Promise<void> {
    const {args, flags} = await this.parse(Plan)

    const name = flags.name ?? 'world'
    this.log(`hello ${name} from /Users/kevinwang/Projects/codify/codify-core/src/commands/plan.ts`)
    if (args.file && flags.force) {
      this.log(`you input --force and --file: ${args.file}`)
    }
  }
}
