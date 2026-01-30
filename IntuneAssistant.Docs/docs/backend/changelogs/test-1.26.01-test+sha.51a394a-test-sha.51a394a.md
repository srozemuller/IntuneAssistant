---
sidebar_position: 1
title: TEST 1.26.01-test+sha.51a394a
---

# TEST Release 1.26.01-test+sha.51a394a-test+sha.51a394a

**Released:** 2026-01-30 16:02:23 UTC UTC  
**Commit:** [51a394a](https://github.com/srozemuller/IntuneAssistant.Backend/commit/51a394a5fcb57fe252b3902d4684ce836db64d6e)

## 🚀 Features

- Added groupId rest endpoint for fetching assigned groups info in Assignments Manager by @srozemuller in #318
- Added pagination for apps overview, fixed platform recognition by @srozemuller in #320
- Support for user assignments check by @srozemuller in #324
- Add autopilot profile resources in assignment manager by @srozemuller in #357
- Added scope tag api endpoint for searching scopetags in basic by @srozemuller in #363
- Added api to search for assignments with specific filter by @srozemuller in #380

## 🐛 Bug Fixes

- changed _ to - by @srozemuller in #304
- Fixed bug targeted app confing mapping by @srozemuller in #317
- removed cors check in application itself by @srozemuller in #326
- add debug info by @srozemuller in #339
- back to dbcontext instead of repo by @srozemuller in #340
- Changed license is onboarded check to only isconsentgranted by @srozemuller in #342
- Changed the resource types in export by @srozemuller in #344
- Change customer controller license check by @srozemuller in #345
- Bugfix, assignment finder in migration orchestrator by @srozemuller in #347
- Added variable instead of direct return from database by @srozemuller in #350
- changed request query top parameter from 1000 to 200 by @srozemuller in #353
- Added debug logging in customer allowed task and ignore query filter added by @srozemuller in #356
- Policy type IOS managed app protection policy fix by @srozemuller in #360
- Changed windows update mapping config, handles conflict gracefully, a… by @srozemuller in #361
- Added two policy types to the correct url mapping by @srozemuller in #375

## 🧪 Tests

- Temporary removed problematic test for bypass deployment by @srozemuller in #348

## 🔧 Maintenance

- changelog auto set tag for search changes by @srozemuller in #303
- Removed last deployed date by @srozemuller in #306
- Updated the sentry release version to dynamic by @srozemuller in #308
- Added create changelog after pr merge by @srozemuller in #309
- Added pagination to the devices endpoint by @srozemuller in #315
- Sub resource enum types to main resource types by @srozemuller in #323
- Refactor onboarding process by @srozemuller in #329
- added cache service injection by @srozemuller in #330
- Rewritten migration flow. simplified assignments builder and stripped… by @srozemuller in #333
- Refactor add unit tests to assignments manager by @srozemuller in #334
- Refactor add unit tests to assignments manager by @srozemuller in #337
- Added license and customer check at program level by @srozemuller in #341
- Add unit tests to assignments manager by @srozemuller in #352
- Changed tests to new logic and put in on real business logic by @srozemuller in #358
- Removed warning logging when assignment check is failed, not needed f… by @srozemuller in #362
- Added cooldown phase between batches in migrate process by @srozemuller in #365
- Updated graph sdk by @srozemuller in #377
- Added page size as constant by @srozemuller in #378



<details>
<summary>Uncategorized</summary>

- changed changelog process by @srozemuller in #305
- added slightly delay for api check by @srozemuller in #307
- added separate changelog pipeline by @srozemuller in #310
- Update test_changelog-on-merge.yml by @srozemuller in #311
- tag match between changelog and deploy by @srozemuller in #312
- back to one pipeline by @srozemuller in #313
- write permissions added by @srozemuller in #314
- branding to external json file by @srozemuller in #325
- Updated pipelines for deploy to test and prd by @srozemuller in #327
- Remove cors from app by @srozemuller in #328
- tenant allow removed by @srozemuller in #335
- remove allowed tenants by @srozemuller in #336
- Update test_intuneassistant-api-test-deploy.yml by @srozemuller in #346
- removed logging information entries from loops by @srozemuller in #367
- changed msal logging to error only by @srozemuller in #368
- fixed db relation to usermodel and changed batch chunk for groups by @srozemuller in #369
- Add matching filters for all entities with required Customer relation… by @srozemuller in #370

</details>

---

*This is a TEST prerelease. Changes are deployed to the TEST environment only.*
