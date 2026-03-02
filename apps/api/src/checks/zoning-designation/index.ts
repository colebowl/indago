import type { CheckModule } from '../types'
import { definition } from './definition'
import { persona } from './persona'
import { skill } from './skill'

export const zoningDesignationModule: CheckModule = {
  definition,
  persona,
  skill,
}

export { definition, persona, skill }
