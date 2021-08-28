/**
 * 生成 layadcc
 */
export class layadcc extends polea.pluginsCommand {
    constructor(private root: string) {
        super()
    }

    async execute() {
        super.execute(arguments);
        await this.start();
    }

    private start() {
        return new Promise((resolve) => {
            console.log(`layadcc ${this.workspace}/release/${this.root}/www`)
            polea.exec(`layadcc ${this.workspace}/release/${this.root}/www`, () => {
                resolve(null)
            })
        })
    }
}