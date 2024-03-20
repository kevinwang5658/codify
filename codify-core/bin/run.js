#!/usr/bin/env node

import { execute, handle } from '@oclif/core'

await execute({ dir: import.meta.url })
  .catch(handle)
