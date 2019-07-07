import Kira from './kira'
import {init} from './context'
import * as Config from './config'

const config = Config.parse(process.env.KIRA_CONFIG || '')
if (!config) {
  console.error('invalid config')
  console.error(process.env.KIRA_CONFIG)
  process.exit(1)
} else {
  init(config).then(Kira)
}
