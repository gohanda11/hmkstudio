/*
 * This program is free software: you can redistribute it and/or modify it under
 * the terms of the GNU General Public License as published by the Free Software
 * Foundation, either version 3 of the License, or (at your option) any later
 * version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the GNU General Public License for more
 * details.
 *
 * You should have received a copy of the GNU General Public License along with
 * this program. If not, see <https://www.gnu.org/licenses/>.
 */

import { PersistedState } from "runed"

/** Display language. The default is Japanese. */
export type Locale = "ja" | "en"

export const locales: { value: Locale; label: string }[] = [
  { value: "ja", label: "日本語" },
  { value: "en", label: "English" },
]

const localeState = new PersistedState<Locale>("hmkstudio-locale", "ja")

/**
 * Current display language. Read inside `$derived` or template expressions
 * so the UI updates reactively on language change.
 */
export function getLocale(): Locale {
  const current = localeState.current
  return current === "en" || current === "ja" ? current : "ja"
}

export function setLocale(locale: Locale) {
  localeState.current = locale
}

const en = {
  "sidebar.groupProfiles": "Profiles",
  "sidebar.groupKeyboard": "Keyboard Configuration",
  "sidebar.groupSettings": "Settings",
  "sidebar.tabProfiles": "Profiles",
  "sidebar.tabRemap": "Remap",
  "sidebar.tabPerformance": "Performance",
  "sidebar.tabAdvancedKeys": "Advanced Keys",
  "sidebar.tabGamepad": "Gamepad",
  "sidebar.tabPointing": "Pointing",
  "sidebar.tabCalibration": "Calibration",
  "sidebar.tabSettings": "Settings",

  "layout.windowTooSmall":
    "Your window is too small. Please resize your window, or zoom out.",

  "landing.description":
    "A web-based configurator for libhmk keyboards. Customize keyboard bindings, adjust actuation points, enable Rapid Trigger, and more.",
  "landing.connect": "Connect Keyboard",
  "landing.tryDemo": "Try Demo",
  "landing.disconnected": "{name} disconnected.",
  "landing.connected": "Successfully connected to {name}.",
  "landing.firmwareAvailable":
    " Newer version of the firmware is available.",

  "profile.label": "Profile {profile}",
  "profile.active": "Active",
  "profile.currentActive": "Current Active Profile",

  "menu.exitDemo": "Exit Demo",
  "menu.disconnect": "Disconnect",

  "profiles.title": "Configure Profiles",
  "profiles.description":
    "Manage your keyboard profiles here. Use the menu on each profile to duplicate it from another profile or restore its default bindings. Switch, import, and export the active profile using the toolbar at the top.",
  "profiles.profile": "Profile {profile}",
  "profiles.active": "Active",
  "profiles.openMenu": "Open Menu",
  "profiles.duplicateFrom": "Duplicate From",
  "profiles.restoreDefault": "Restore Default",

  "common.layer": "Layer",
  "common.configureLayout": "Configure Layout",
  "common.info": "Info",

  "remap.resetLayer": "Reset Current Layer",
  "remap.testerHighlight": "Tester highlight",
  "remap.testerHighlightSr": "Toggle key tester highlight",
  "remap.testerReset": "Reset tester",
  "remap.testerPressed": "Pressed",
  "remap.testerHistory": "History",
  "remap.legendLayout": "Legend layout",
  "remap.legendLayoutTooltip": "Legend layout (US / JP)",
  "remap.importProfile": "Import Profile",
  "remap.importProfileTooltip": "Import profile",
  "remap.exportProfile": "Export Profile",
  "remap.exportProfileTooltip": "Export profile",
  "remap.resetProfile": "Reset Profile",
  "remap.resetProfileTooltip": "Reset profile",
  "remap.resetTitle": "Reset Profile {profile}?",
  "remap.resetDescription":
    "This restores the keymap and all bindings of this profile to their defaults. This cannot be undone.",
  "remap.cancel": "Cancel",
  "remap.reset": "Reset",

  "dialog.editKey": "Edit Key",
  "dialog.editKeyDescription":
    "Hold modifiers together with this key, or configure a tap-hold binding that registers different keycodes when tapped and held.",
  "dialog.combo": "Combo",
  "dialog.tapHold": "Tap-Hold",
  "dialog.baseKeyNote":
    "The base key is shown for reference. Change it from the key list on the right side of the Remap tab.",
  "dialog.modifierSide": "Modifier side",
  "dialog.left": "Left",
  "dialog.right": "Right",
  "dialog.noModifiers":
    "No modifiers selected. Applying restores the plain key.",
  "dialog.appliesAs": "Applies as {summary}.",
  "dialog.tap": "Tap",
  "dialog.hold": "Hold",
  "dialog.assign": "Assign",
  "dialog.cancel": "Cancel",
  "dialog.apply": "Apply",

  "modtap.tooltip": "Tap: {tap} / Hold: {hold}",

  "keycodes.search": "Search...",
  "keycodes.clearSearch": "Clear Search",
  "keycodes.catBasic": "Basic",
  "keycodes.catExtended": "Extended",
  "keycodes.catSpecial": "Special",
  "keycodes.catProfiles": "Profiles",
  "keycodes.catMedia": "Media",
  "keycodes.catMouse": "Mouse",
  "keycodes.catAdvancedKeys": "Advanced Keys",
  "keycodes.catGamepad": "Gamepad",
  "keycodes.catUnknown": "Unknown",

  "tester.reset": "Reset",
  "tester.pressedKeys": "Pressed Keys",
  "tester.releasedKeys": "Released Keys",

  "pointing.title": "Pointing Device",
  "pointing.description":
    "Configure the trackball pointing device: pointer speed and direction, scrolling, and axis snapping.",
  "pointing.firmwareRequired": "Firmware Update Required",
  "pointing.firmwareRequiredDescription":
    "Pointing device configuration requires firmware {min} or later. This keyboard is running {version}. Update the firmware from the Settings tab to configure the pointing device.",
  "pointing.loadFailed": "Failed to Load Configuration",
  "pointing.retry": "Retry",
  "pointing.noDevice": "No Pointing Device",
  "pointing.noDeviceDescription":
    "This keyboard does not have a pointing device, so there is nothing to configure.",
  "pointing.deviceTitle": "Pointing Device",
  "pointing.deviceDescription":
    "Enable or disable the trackball and set its sensor resolution.",
  "pointing.enabled": "Enabled",
  "pointing.enabledDescription":
    "Enable the pointing device. When disabled, the sensor is turned off and no cursor movement is reported.",
  "pointing.cpiDescription":
    "Sensor resolution in counts per inch (200-3200 in steps of 200). Higher values move the cursor further for the same physical movement.",
  "pointing.conflictTitle": "Conflicting Layers",
  "pointing.conflictDescription":
    "The Auto Mouse Layer and the Scroll Layer are both set to the same layer. Choose a different Auto Mouse Target Layer or Scroll Layer, or disable one of them.",
  "pointing.layerConflict":
    "The Auto Mouse Layer and the Scroll Layer cannot be the same layer. Choose a different Auto Mouse Target Layer or Scroll Layer first.",
  "pointing.autoMouseTitle": "Auto Mouse Layer",
  "pointing.autoMouseDescription":
    "Dedicate a keymap layer to mouse actions: it is activated while the pointing device moves and deactivates when it stops.",
  "pointing.enableAutoMouse": "Enable Auto Mouse Layer",
  "pointing.enableAutoMouseDescription":
    "Automatically switch to the auto mouse layer while the pointing device is moving.",
  "pointing.targetLayer": "Target Layer",
  "pointing.targetLayerDescription":
    "The layer to activate while the pointing device is moving.",
  "pointing.orientationTitle": "Orientation",
  "pointing.orientationDescription":
    "Compensate for a tilted sensor and flip the movement axes.",
  "pointing.rotationDescription":
    "Rotation of the sensor in degrees (0-359). Set this to the angle the sensor is mounted at so the reported movement is rotated back to the keyboard axes.",
  "pointing.sensorRotation": "Sensor Rotation",
  "pointing.invertX": "Invert X Axis",
  "pointing.invertXDescription": "Reverse the horizontal cursor direction.",
  "pointing.invertY": "Invert Y Axis",
  "pointing.invertYDescription": "Reverse the vertical cursor direction.",
  "pointing.swapAxes": "Swap Axes",
  "pointing.swapAxesDescription":
    "Swap the horizontal and vertical movement axes.",
  "pointing.scrollTitle": "Scrolling",
  "pointing.scrollDescription":
    "Turn pointing movement into scroll wheel ticks on a dedicated layer.",
  "pointing.invertScroll": "Invert Scroll",
  "pointing.invertScrollDescription": "Reverse the scroll wheel direction.",
  "pointing.scrollLayer": "Scroll Layer",
  "pointing.scrollLayerDescription":
    "The layer on which pointing movement is sent as scroll wheel ticks. Disabled turns scroll mode off entirely.",
  "pointing.scrollDivisor": "Scroll Divisor",
  "pointing.scrollDivisorDescription":
    "Raw sensor counts per scroll wheel tick (1-255). Lower values scroll faster.",
  "pointing.axisSnapping": "Axis Snapping",
  "pointing.axisSnappingDescription":
    "Keep cursor movement on a straight line when moving mostly along one axis.",
  "pointing.snapAxis": "Snap Axis",
  "pointing.snapAxisDescription":
    "The axis cursor movement is snapped to while the other axis stays within the snap threshold.",
  "pointing.snapThreshold": "Snap Threshold",
  "pointing.snapThresholdDescription":
    "Movement of the other axis below this percent of the dominant axis is ignored.",
  "pointing.disabled": "Disabled",
  "pointing.layer": "Layer {layer}",
  "pointing.xAxis": "X Axis",
  "pointing.yAxis": "Y Axis",
  "pointing.figureCpi":
    "Diagram: higher CPI moves the cursor further for the same trackball movement",
  "pointing.figureRotation":
    "Diagram: reported movement rotates with the sensor angle",
  "pointing.figureInvertX": "Diagram: invert X flips left and right",
  "pointing.figureInvertY": "Diagram: invert Y flips up and down",
  "pointing.figureSwap": "Diagram: swap exchanges the X and Y axes",
  "pointing.figureScroll":
    "Diagram: trackball movement becomes scroll ticks on the scroll layer",
  "pointing.figureSnap":
    "Diagram: near-axis movement snaps to a straight line",
  "pointing.figureAutoMouse":
    "Diagram: movement temporarily switches to the mouse layer",
  "pointing.extendedUnavailable": "Extended Settings Unavailable",
  "pointing.extendedUnavailableDescription":
    "Firmware {version} supports only the basic pointing settings above. Sensor rotation, axis orientation (invert/swap axes), scrolling behavior and axis snapping require firmware {min} or later. Update the firmware from the Settings tab to configure these settings.",
  "dfu.timeout":
    "Timed out waiting for a DFU device to be selected ({seconds} seconds). If the keyboard is stuck in DFU bootloader mode, unplug it and plug it back in (or press its reset button), then click \"Select DFU Device\" again. On Windows, make sure the DFU device is bound to a WinUSB driver (Zadig).",
  "dfu.mismatch":
    "The selected DFU device ({device}) does not match \"{name}\", which expects the {expected} DFU bootloader. To avoid flashing the wrong keyboard, disconnect the other device and select the DFU device that appeared when \"{name}\" restarted.",
  "dfu.serialNone": ", and it exposes no serial number",
  "dfu.serialSome": " (serial \"{serial}\")",
  "dfu.identityUnknown":
    "The expected DFU bootloader for \"{name}\" could not be verified, and a DFU bootloader does not identify which keyboard it belongs to",
  "dfu.identityMatch":
    "The selected DFU device matches the {expected} bootloader expected for \"{name}\", but the bootloader cannot prove that it belongs to this keyboard",
  "dfu.identityTail":
    ". If more than one DFU-capable keyboard is connected, disconnect the others so that only \"{name}\" remains attached, and verify the device summary above before flashing.",
  "dfu.phaseErase": "Erasing flash memory...",
  "dfu.phaseWrite": "Writing firmware...",
  "dfu.phaseManifest": "Manifesting new firmware...",

  "settings.pollingTitle": "8000Hz Polling Rate",
  "settings.pollingDescription":
    "Enable the 8000Hz polling rate for faster response times, but may increase the CPU usage of the host device. Restart the keyboard to apply changes. This setting applies globally across all profiles.",
  "settings.restartTitle": "Restart Keyboard",
  "settings.restartDescription":
    "The keyboard will disconnect and reconnect. No changes will be made to your keyboard settings.",
  "settings.restartButton": "Restart Keyboard",
  "settings.bootloaderTitle": "Enter Bootloader Mode",
  "settings.bootloaderDescription":
    "The keyboard will restart and enter bootloader mode if it is supported by the firmware. No changes will be made to your keyboard settings.",
  "settings.bootloaderButton": "Enter Bootloader Mode",
  "settings.factoryTitle": "Factory Reset",
  "settings.factoryDescription":
    "Revert the keyboard to its factory settings defined by the firmware. All user data and settings will be lost.",
  "settings.factoryButton": "Factory Reset",
  "settings.factoryConfirmTitle": "Factory Reset?",
  "settings.factoryConfirmDescription":
    "Are you sure you want to factory reset your keyboard?",
  "settings.cancel": "Cancel",
  "settings.languageTitle": "Language",
  "settings.languageDescription":
    "The display language of the configurator. Applies immediately and is saved on this device.",
  "settings.languageLabel": "Display language",

  "firmware.title": "Firmware",
  "firmware.current": "Current version: {version}",
  "firmware.checking": "Checking for updates...",
  "firmware.latest": "Latest version: {version}",
  "firmware.newAvailable": "New version available",
  "firmware.upToDate": "Your firmware is up to date.",
  "firmware.noBuild": "No firmware build is available for {name}.",
  "firmware.checkFailed": "Failed to check for updates.",
  "firmware.retry": "Retry",
  "firmware.webUsb":
    "Firmware updates require WebUSB. Please use a Chromium-based browser (Chrome, Edge, etc.).",
  "firmware.update": "Update Firmware",

  "dfu.title": "Firmware Update",
  "dfu.versionRange": "- {current} to {latest}",
  "dfu.preparing": "Downloading the latest firmware from GitHub...",
  "dfu.selectBody1":
    'The keyboard is restarting in DFU bootloader mode. Click "Select DFU Device" and choose the DFU device (e.g. "STM32 BOOTLOADER" or "AT32 DFU", VID 0x2E3C/0x0483, PID 0xDF11). If several DFU devices are listed, choose the one that appeared when your keyboard restarted.',
  "dfu.selectBody2":
    "On Windows, the DFU device requires a WinUSB driver (installable with Zadig). The keyboard disconnects from the configurator during this process; this is expected. The update waits {seconds} seconds for the DFU device to be selected.",
  "dfu.cancel": "Cancel",
  "dfu.selectDevice": "Select DFU Device",
  "dfu.connecting": "Connecting...",
  "dfu.readyBody":
    "DFU device connected. Ready to write {size} of firmware to {name}.",
  "dfu.verifyTitle": "Verify the DFU device",
  "dfu.confirmLabel":
    'I confirm that this DFU device belongs to the "{name}" keyboard I am updating.',
  "dfu.doNotDisconnect": "Do not disconnect the keyboard while flashing.",
  "dfu.flash": "Flash Firmware",
  "dfu.doneTitle": "Firmware updated successfully.",
  "dfu.doneBody":
    "The keyboard is restarting with the new firmware. Close this dialog and connect the keyboard again.",
  "dfu.close": "Close",
  "dfu.errorBody":
    "If the keyboard became unresponsive, unplug it and plug it back in, then try again. On Windows, make sure a WinUSB driver is bound to the DFU device.",
  "dfu.tryAgain": "Try Again",
  "dfu.disconnected": "The DFU device was disconnected.",
  "dfu.cancelled":
    'Firmware update cancelled. "{name}" may still be in DFU bootloader mode: if it does not reconnect as a keyboard, unplug it and plug it back in (or press its reset button).',

  "toast.profileImported": "Successfully imported Profile {profile}.",
  "toast.profileImportInvalidJson":
    "Failed to import Profile {profile}: The selected file is not a valid JSON.",
  "toast.profileImportFailed":
    "Failed to import Profile {profile}: {error}",
  "toast.profileExported": "Successfully exported Profile {profile}.",
  "toast.profileExportFailed":
    "Failed to export Profile {profile}: {error}",
  "toast.modComboSlots":
    "Could not add the modifier combo: all Advanced Keys slots are in use. Clear an Advanced Key you no longer need to free a slot, then try again.",
  "toast.macroNodes":
    "Could not add the modifier combo: all Macro nodes are in use. Clear a macro you no longer need to free a slot, then try again.",
  "toast.tapHoldSlots":
    "Could not add the tap-hold binding: all Advanced Keys slots are in use. Clear an Advanced Key you no longer need to free a slot, then try again.",
  "toast.calibrationSaved": "Successfully saved calibration threshold.",

  "error.pageNotFound": "Page not found",
  "error.backHome": "Back to home",

  "performance.selectAll": "Select All",
  "performance.deselectAll": "Deselect All",
  "performance.showKeymap": "Show Keymap",
  "performance.resetSelected": "Reset Selected",
  "performance.actuationPointTitle": "Actuation Point",
  "performance.actuationPointDescription":
    "Set the specific distance at which a key press and release is registered.",
  "performance.actuationPointDescriptionRt":
    "Set the specific distance at which Rapid Trigger activates and deactivates.",
  "performance.rtSensitivityTitle": "Rapid Trigger Sensitivity",
  "performance.rtSensitivityDescription":
    "Set the minimum distance change required for Rapid Trigger to register a key press or release.",
  "performance.rtPressTitle": "Rapid Trigger Press Sensitivity",
  "performance.rtPressDescriptionSeparated":
    "Set the minimum distance change required for Rapid Trigger to register a key press.",
  "performance.rtReleaseTitle": "Rapid Trigger Release Sensitivity",
  "performance.rtReleaseDescription":
    "Set the minimum distance change required for Rapid Trigger to register a key release.",
  "performance.enableRtTitle": "Enable Rapid Trigger",
  "performance.enableRtDescription":
    "Rapid Trigger registers key presses and releases based on changes in key distance rather than absolute position. It activates and deactivates at the actuation point.",
  "performance.separateSensitivityTitle": "Separate Press/Release Sensitivity",
  "performance.separateSensitivityDescription":
    "Configure sensitivity for key presses and releases independently.",
  "performance.continuousTitle": "Continuous Rapid Trigger",
  "performance.continuousDescription":
    "Deactivates Rapid Trigger only when the key is fully released, instead of at the actuation point.",
  "performance.continuousAbbreviation": "C",

  "advkeys.createMenu.cancel": "Cancel",
  "advkeys.createMenu.continue": "Continue",
  "advkeys.createMenu.selectKeysPlural":
    "Select {numKeys} keys to assign {title} to.",
  "advkeys.createMenu.selectKeysSingle":
    "Select {numKeys} key to assign {title} to.",
  "advkeys.createMenu.keyLabel": "Key {index}",
  "advkeys.createMenu.assign": "Assign",
  "advkeys.deleteDialog.title": "Remove this {title} binding?",
  "advkeys.deleteDialog.description":
    "Are you sure you want to remove this binding?",
  "advkeys.deleteDialog.cancel": "Cancel",
  "advkeys.deleteDialog.remove": "Remove",
  "advkeys.mainMenu.addTitle": "Add Advanced Key",
  "advkeys.mainMenu.activeTitle": "Active Advanced Keys ({count}/{total})",
  "advkeys.mainMenu.empty": "No active advanced keys...",
  "advkeys.activeBinding.edit": "Edit",
  "advkeys.activeBinding.delete": "Delete",
  "advkeys.configMenu.loading": "Loading...",
  "advkeys.configMenu.delete": "Delete",
  "advkeys.configMenu.done": "Done",
  "advkeys.tickRate.description":
    "The tick rate determines the delay between two consecutive actions performed by Advanced Keys. For example, a tap action performs a key press and release consecutively. A lower tick rate means less delay, but may result in missed inputs if the game or application cannot keep up with processing the inputs.",
  "advkeys.tickRate.title": "Tick Rate",
  "advkeys.tickRate.note":
    "The tick rate is per profile and only affects Dynamic Keystroke, Tap-Hold, and Macro keys.",
  "advkeys.keyTester.pressed": "Pressed Keys",
  "advkeys.keyTester.released": "Released Keys",
  "advkeys.tabs.bindings": "Bindings",
  "advkeys.tabs.advanced": "Advanced",
  "advkeys.tabs.keyTester": "Key Tester",
  "advkeys.tabs.performance": "Performance",
  "advkeys.toggle.configureTitle": "Configure Toggle Binding",
  "advkeys.toggle.configureDescription":
    "Assign a binding for the toggle action of the key.",
  "advkeys.toggle.tappingTermTitle": "Tapping Term",
  "advkeys.toggle.tappingTermDescription":
    "Set the duration the key must be held to perform the normal key behavior.",
  "advkeys.tapHold.configureTitle": "Configure Tap-Hold Bindings",
  "advkeys.tapHold.configureDescription":
    "Assign bindings for tap and hold actions of the key.",
  "advkeys.tapHold.tapLabel": "Tap",
  "advkeys.tapHold.holdLabel": "Hold",
  "advkeys.tapHold.holdOnOtherKeyPressTitle": "Hold on Other Key Press",
  "advkeys.tapHold.holdOnOtherKeyPressDescription":
    "Immediately perform the hold action if another non-Tap-Hold key is pressed.",
  "advkeys.tapHold.tappingTermTitle": "Tapping Term",
  "advkeys.tapHold.tappingTermDescription":
    "Set the duration the key must be held to perform the hold action.",
  "advkeys.nullBind.configureTitle":
    "Configure Null Bind Resolution Behavior",
  "advkeys.nullBind.configureDescription":
    "Select how Null Bind resolves key presses when both keys are pressed simultaneously.",
  "advkeys.nullBind.info": "Info",
  "advkeys.nullBind.alternativeBehaviorTitle":
    "Alternative Fully Pressed Behavior",
  "advkeys.nullBind.alternativeBehaviorDescription":
    "Enable this option to register both key presses when keys are fully pressed simultaneously, bypassing the resolution behavior.",
  "advkeys.nullBind.rapidTriggerTitle": "Enable Rapid Trigger",
  "advkeys.nullBind.rapidTriggerDescription":
    "Enable Rapid Trigger to compare keys only when Rapid Trigger registers a key press. Additional Rapid Trigger options are available in the Performance tab.",
  "advkeys.nullBind.actuationPointTitle": "Actuation Point",
  "advkeys.nullBind.actuationPointDescription":
    "Set the actuation point at which Null Bind becomes active.",
  "advkeys.nullBind.bottomOutPointTitle": "Bottom Out Point",
  "advkeys.nullBind.bottomOutPointDescription":
    "Set the actuation point at which the key is considered fully pressed.",
  "advkeys.macro.configureTitle": "Configure Macro Actions",
  "advkeys.macro.configureDescription":
    "Create a sequence of actions to be triggered when the key is pressed. Assign bindings for each action using the menu on the right.",
  "advkeys.macro.add": "Add",
  "advkeys.macro.empty": "No macro actions...",
  "advkeys.macro.actionLabel": "Action",
  "advkeys.macro.delayLabel": "Delay",
  "advkeys.macro.delete": "Delete",
  "advkeys.dks.configureTitle": "Configure DKS Bindings",
  "advkeys.dks.configureDescription":
    "Assign bindings using the menu on the right. For a tap action, click the plus icon once. For a hold action, click the plus icon and drag it to the desired key position based on your preferred behavior.",
  "advkeys.dks.actuationPointTitle": "Actuation Point",
  "advkeys.dks.actuationPointDescription":
    'Set the actuation point for "Key press" and "Key release" actions.',
  "advkeys.dks.bottomOutPointTitle": "Bottom Out Point",
  "advkeys.dks.bottomOutPointDescription":
    'Set the actuation point for "Key fully pressed" and "Key released from fully pressed" actions.',
  "advkeys.dks.rapidTriggerNote":
    "Rapid Trigger is automatically disabled for Dynamic Keystroke keys.",
  "advkeys.dks.deleteAction": "Delete Action",
  "advkeys.type.nullBindTitle": "Null Bind",
  "advkeys.type.nullBindDescription":
    "Monitor 2 selected keys and register them according to your chosen behavior.",
  "advkeys.type.dksTitle": "Dynamic Keystroke",
  "advkeys.type.dksDescription":
    "Assign up to 4 bindings to a single key. Each binding can be configured with 4 different actions based on the key's position.",
  "advkeys.type.tapHoldTitle": "Tap-Hold",
  "advkeys.type.tapHoldDescription":
    "Register different bindings depending on whether the key is tapped or held.",
  "advkeys.type.toggleTitle": "Toggle",
  "advkeys.type.toggleDescription":
    "Toggle between key press and release states. Hold the key for a normal key behavior.",
  "advkeys.type.macroTitle": "Macro",
  "advkeys.type.macroDescription":
    "Run a sequence of configurable actions when the key is pressed.",
  "advkeys.unknownTitle": "Unknown ({value})",
  "advkeys.unknownDescription":
    "This Advanced Key type is not recognized.",
  "advkeys.nullBindBehavior.lastTitle": "Last Input Priority",
  "advkeys.nullBindBehavior.lastDescription":
    "Activate the key that was pressed last.",
  "advkeys.nullBindBehavior.primaryTitle": "Absolute Priority (Key 1)",
  "advkeys.nullBindBehavior.primaryDescription":
    "Key 1 will take priority over Key 2.",
  "advkeys.nullBindBehavior.secondaryTitle": "Absolute Priority (Key 2)",
  "advkeys.nullBindBehavior.secondaryDescription":
    "Key 2 will take priority over Key 1.",
  "advkeys.nullBindBehavior.neutralTitle": "Neutral",
  "advkeys.nullBindBehavior.neutralDescription":
    "Neither key will be activated.",
  "advkeys.nullBindBehavior.distanceTitle":
    "Distance Priority (Rappy Snappy)",
  "advkeys.nullBindBehavior.distanceDescription":
    "Activate whichever key is pressed down further.",
  "advkeys.dks.headerPress": "Key press",
  "advkeys.dks.headerFullyPressed": "Key fully pressed",
  "advkeys.dks.headerReleaseFromFully": "Key release from fully pressed",
  "advkeys.dks.headerRelease": "Key release",
  "advkeys.macro.actionTap": "Tap",
  "advkeys.macro.actionPress": "Press",
  "advkeys.macro.actionRelease": "Release",

  "gamepad.setup.title": "Configure Controller Bindings",
  "gamepad.setup.description": "Assign gamepad buttons to your keyboard.",
  "gamepad.setup.keyboardEnabledTitle": "Enable Keyboard Inputs",
  "gamepad.setup.keyboardEnabledDescription":
    "Allow keyboard inputs to be sent along with gamepad inputs.",
  "gamepad.setup.overrideTitle": "Gamepad Override",
  "gamepad.setup.overrideDescription":
    "Disable keyboard inputs on keys bound to gamepad buttons.",
  "gamepad.menu.setup": "Setup",
  "gamepad.menu.analog": "Analog",
  "gamepad.menu.xinputDisabled": "XInput interface is disabled",
  "gamepad.menubar.xinputTitle": "Enable XInput Interface",
  "gamepad.menubar.xinputTooltip":
    "Allow your keyboard to be recognized as an Xbox controller for gamepad input. Restart the keyboard to apply changes. This setting applies globally across all profiles.",
  "gamepad.analog.title": "Configure Analog Curve",
  "gamepad.analog.description":
    "Modify how keyboard analog values translate to gamepad analog inputs. You can manually adjust the analog curve or select a preset from below. These settings affect both joysticks and triggers.",
  "gamepad.analog.squareTitle": "Square Joystick Mode",
  "gamepad.analog.squareDescription":
    "Remove the circular boundaries of the joystick for full range of motion.",
  "gamepad.analog.snappyTitle": "Snappy Joystick",
  "gamepad.analog.snappyDescription":
    "Use the maximum analog value between opposite joystick axes instead of combining them for more responsive movement.",
  "gamepad.analogCurve.startDeadzone": "Key Start Deadzone",
  "gamepad.analogCurve.startDeadzoneTooltip":
    "No gamepad analog input will be sent.",
  "gamepad.analogCurve.endDeadzone": "Key End Deadzone",
  "gamepad.analogCurve.endDeadzoneTooltip":
    "Maximum gamepad analog input will be sent. For joysticks, the angle will snap to the nearest 45 degree, functioning similar to a D-Pad.",
  "gamepad.analogCurve.analogValueLabel": "Analog Value",
  "gamepad.analogCurve.distanceLabel": "Key Press Distance",
  "gamepad.analogCurve.presetLinear": "Linear",
  "gamepad.analogCurve.presetAggressive": "Aggressive",
  "gamepad.analogCurve.presetSlow": "Slow",
  "gamepad.analogCurve.presetSmooth": "Smooth",
  "gamepad.analogCurve.presetStep": "Step",
  "gamepad.analogCurve.presetInstant": "Instant",
  "gamepad.analogCurve.presetDigital": "Digital",

  "calibration.warningBadge": "Warning",
  "calibration.warningTooltip":
    "This tab requests data from the keyboard at a high frequency, which may impact performance. Please close this tab or switch to another one when performing other performance-sensitive tasks with your keyboard.",
  "calibration.saveBottomOutTitle": "Save Bottom Out Threshold",
  "calibration.saveBottomOutDescription":
    "Periodically save the per-key bottom-out threshold values after some inactivity to be restored on next boot. The saved values will only be cleared on recalibration. This setting applies globally across all profiles.",
  "calibration.initialNoiseFloorTitle": "Initial Noise Floor",
  "calibration.initialNoiseFloorDescription":
    "The initial noise floor represents the estimated analog value when a key is at rest. It should be set slightly higher than the actual analog readings of all keys in their resting position to prevent deadzones. Recalibrate the keyboard to apply changes. This setting applies globally across all profiles.",
  "calibration.initialBottomOutTitle": "Initial Bottom Out Threshold",
  "calibration.initialBottomOutDescription":
    "The initial bottom out threshold represents the estimated change in analog value when a key is fully pressed. It should be set slightly lower than the actual change in analog readings when keys are fully pressed to prevent deadzones. Recalibrate the keyboard to apply changes. This setting applies globally across all profiles.",
  "calibration.recalibrate": "Recalibrate",
  "calibration.saveCurrentThreshold": "Save Current Threshold",
  "calibration.pressedKeys": "Pressed Keys",
  "calibration.releasedKeys": "Released Keys",

  "theme.toggle": "Toggle theme",
  "theme.light": "Light",
  "theme.dark": "Dark",
  "theme.system": "System",
}

type Dictionary = typeof en

const ja: Dictionary = {
  "sidebar.groupProfiles": "プロフィール",
  "sidebar.groupKeyboard": "キーボード設定",
  "sidebar.groupSettings": "設定",
  "sidebar.tabProfiles": "プロフィール",
  "sidebar.tabRemap": "リマップ",
  "sidebar.tabPerformance": "パフォーマンス",
  "sidebar.tabAdvancedKeys": "高度なキー",
  "sidebar.tabGamepad": "ゲームパッド",
  "sidebar.tabPointing": "ポインティング",
  "sidebar.tabCalibration": "キャリブレーション",
  "sidebar.tabSettings": "設定",

  "layout.windowTooSmall":
    "ウィンドウが小さすぎます。ウィンドウを拡大するか、縮小表示してください。",

  "landing.description":
    "libhmk キーボード用の Web ベース設定ツール。キーバインドの変更、アクチュエーションポイントの調整、Rapid Trigger の有効化などができます。",
  "landing.connect": "キーボードを接続",
  "landing.tryDemo": "デモを試す",
  "landing.disconnected": "{name} が切断されました。",
  "landing.connected": "{name} に接続しました。",
  "landing.firmwareAvailable":
    " 新しいバージョンのファームウェアが利用可能です。",

  "profile.label": "プロフィール {profile}",
  "profile.active": "使用中",
  "profile.currentActive": "現在の使用中プロフィール",

  "menu.exitDemo": "デモを終了",
  "menu.disconnect": "切断",

  "profiles.title": "プロフィールの設定",
  "profiles.description":
    "キーボードのプロフィールを管理します。各プロフィールのメニューから、他のプロフィールの複製や既定のバインドへの復元ができます。使用中のプロフィールの切替・インポート・エクスポートは上部のツールバーから行えます。",
  "profiles.profile": "プロフィール {profile}",
  "profiles.active": "使用中",
  "profiles.openMenu": "メニューを開く",
  "profiles.duplicateFrom": "複製元",
  "profiles.restoreDefault": "既定に戻す",

  "common.layer": "レイヤー",
  "common.configureLayout": "レイアウトを設定",
  "common.info": "情報",

  "remap.resetLayer": "現在のレイヤーをリセット",
  "remap.testerHighlight": "テスターのハイライト",
  "remap.testerHighlightSr": "キーテスターのハイライトを切替",
  "remap.testerReset": "テスターをリセット",
  "remap.testerPressed": "押下中",
  "remap.testerHistory": "履歴",
  "remap.legendLayout": "キー表示レイアウト",
  "remap.legendLayoutTooltip": "キー表示レイアウト (US / JP)",
  "remap.importProfile": "プロフィールをインポート",
  "remap.importProfileTooltip": "プロフィールをインポート",
  "remap.exportProfile": "プロフィールをエクスポート",
  "remap.exportProfileTooltip": "プロフィールをエクスポート",
  "remap.resetProfile": "プロフィールをリセット",
  "remap.resetProfileTooltip": "プロフィールをリセット",
  "remap.resetTitle": "プロフィール {profile} をリセットしますか?",
  "remap.resetDescription":
    "このプロフィールのキーマップと全てのバインドを既定に戻します。元には戻せません。",
  "remap.cancel": "キャンセル",
  "remap.reset": "リセット",

  "dialog.editKey": "キーの編集",
  "dialog.editKeyDescription":
    "このキーと同時に押す修飾キーを設定するか、タップ時とホールド時で異なるキーコードを登録するタップホールドを設定します。",
  "dialog.combo": "コンボ",
  "dialog.tapHold": "タップホールド",
  "dialog.baseKeyNote":
    "ベースキーは参照用に表示されています。変更はリマップタブ右側のキーリストから行えます。",
  "dialog.modifierSide": "修飾キーの左右",
  "dialog.left": "左",
  "dialog.right": "右",
  "dialog.noModifiers":
    "修飾キーが選択されていません。適用すると素のキーに戻ります。",
  "dialog.appliesAs": "{summary} として適用されます。",
  "dialog.tap": "タップ",
  "dialog.hold": "ホールド",
  "dialog.assign": "割当",
  "dialog.cancel": "キャンセル",
  "dialog.apply": "適用",

  "modtap.tooltip": "タップ: {tap} / ホールド: {hold}",

  "keycodes.search": "検索...",
  "keycodes.clearSearch": "検索をクリア",
  "keycodes.catBasic": "基本",
  "keycodes.catExtended": "拡張",
  "keycodes.catSpecial": "特殊",
  "keycodes.catProfiles": "プロフィール",
  "keycodes.catMedia": "メディア",
  "keycodes.catMouse": "マウス",
  "keycodes.catAdvancedKeys": "高度なキー",
  "keycodes.catGamepad": "ゲームパッド",
  "keycodes.catUnknown": "不明",

  "tester.reset": "リセット",
  "tester.pressedKeys": "押下中のキー",
  "tester.releasedKeys": "離したキー",

  "pointing.title": "ポインティングデバイス",
  "pointing.description":
    "トラックボールのポインティングデバイスを設定します: ポインターの速度と方向、スクロール、軸スナップ。",
  "pointing.firmwareRequired": "ファームウェアの更新が必要です",
  "pointing.firmwareRequiredDescription":
    "ポインティングデバイスの設定にはファームウェア {min} 以降が必要です。このキーボードは {version} を実行中です。設定タブからファームウェアを更新してください。",
  "pointing.loadFailed": "設定の読み込みに失敗しました",
  "pointing.retry": "再試行",
  "pointing.noDevice": "ポインティングデバイスがありません",
  "pointing.noDeviceDescription":
    "このキーボードにはポインティングデバイスがないため、設定項目はありません。",
  "pointing.deviceTitle": "ポインティングデバイス",
  "pointing.deviceDescription":
    "トラックボールの有効/無効とセンサーの解像度を設定します。",
  "pointing.enabled": "有効",
  "pointing.enabledDescription":
    "ポインティングデバイスを有効にします。無効にするとセンサーが停止し、カーソル移動は報告されません。",
  "pointing.cpiDescription":
    "センサーの解像度 (200-3200、200 刻み、単位 CPI)。値を大きくすると同じ操作でのカーソル移動量が増えます。",
  "pointing.conflictTitle": "レイヤーが競合しています",
  "pointing.conflictDescription":
    "オートマウスレイヤーとスクロールレイヤーが同じレイヤーに設定されています。オートマウスの対象レイヤーかスクロールレイヤーを変更するか、どちらかを無効にしてください。",
  "pointing.layerConflict":
    "オートマウスレイヤーとスクロールレイヤーを同じレイヤーにはできません。先にオートマウスの対象レイヤーかスクロールレイヤーを変更してください。",
  "pointing.autoMouseTitle": "オートマウスレイヤー",
  "pointing.autoMouseDescription":
    "マウス操作専用のキーマップレイヤーを用意します: ポインティングデバイスの操作中は有効になり、停止すると無効になります。",
  "pointing.enableAutoMouse": "オートマウスレイヤーを有効化",
  "pointing.enableAutoMouseDescription":
    "ポインティングデバイスの操作中、自動的にオートマウスレイヤーに切り替えます。",
  "pointing.targetLayer": "対象レイヤー",
  "pointing.targetLayerDescription":
    "ポインティングデバイスの操作中に有効になるレイヤー。",
  "pointing.orientationTitle": "向き",
  "pointing.orientationDescription":
    "傾けて取り付けられたセンサーを補正し、移動軸を反転します。",
  "pointing.rotationDescription":
    "センサーの回転角度 (0-359 度)。センサーの取付角度に合わせると、報告される移動方向がキーボードの軸に補正されます。",
  "pointing.sensorRotation": "センサーの回転",
  "pointing.invertX": "X 軸を反転",
  "pointing.invertXDescription": "カーソルの左右方向を反転します。",
  "pointing.invertY": "Y 軸を反転",
  "pointing.invertYDescription": "カーソルの上下方向を反転します。",
  "pointing.swapAxes": "軸を入替",
  "pointing.swapAxesDescription": "左右と上下の移動軸を入れ替えます。",
  "pointing.scrollTitle": "スクロール",
  "pointing.scrollDescription":
    "専用レイヤーでポインティング操作をスクロールホイールとして送信します。",
  "pointing.invertScroll": "スクロールを反転",
  "pointing.invertScrollDescription": "スクロールホイールの方向を反転します。",
  "pointing.scrollLayer": "スクロールレイヤー",
  "pointing.scrollLayerDescription":
    "ポインティング操作をスクロールとして送信するレイヤー。無効にするとスクロールモード全体がオフになります。",
  "pointing.scrollDivisor": "スクロール除数",
  "pointing.scrollDivisorDescription":
    "スクロール 1 刻みあたりのセンサーカウント数 (1-255)。小さいほど速くスクロールします。",
  "pointing.axisSnapping": "軸スナップ",
  "pointing.axisSnappingDescription":
    "ほぼ一軸方向の移動時にカーソル移動を直線に保ちます。",
  "pointing.snapAxis": "スナップ軸",
  "pointing.snapAxisDescription":
    "他の軸がスナップしきい値内に収まる間、カーソル移動を吸着させる軸。",
  "pointing.snapThreshold": "スナップしきい値",
  "pointing.snapThresholdDescription":
    "主要な軸に対する割合で、この値を下回る他軸の移動は無視されます。",
  "pointing.disabled": "無効",
  "pointing.layer": "レイヤー {layer}",
  "pointing.xAxis": "X 軸",
  "pointing.yAxis": "Y 軸",
  "pointing.figureCpi":
    "図解: CPI が高いほど同じトラックボール操作でのカーソル移動量が増えます",
  "pointing.figureRotation":
    "図解: 報告される移動方向はセンサーの角度に応じて回転します",
  "pointing.figureInvertX": "図解: X 反転で左右が入れ替わります",
  "pointing.figureInvertY": "図解: Y 反転で上下が入れ替わります",
  "pointing.figureSwap": "図解: 軸入替で X 軸と Y 軸が交換されます",
  "pointing.figureScroll":
    "図解: スクロールレイヤーではトラックボール操作がスクロール刻みになります",
  "pointing.figureSnap": "図解: ほぼ一軸方向の移動は直線に吸着します",
  "pointing.figureAutoMouse":
    "図解: 操作中は一時的にマウスレイヤーに切り替わります",
  "pointing.extendedUnavailable": "拡張設定は利用できません",
  "pointing.extendedUnavailableDescription":
    "ファームウェア {version} では上記の基本設定のみ対応しています。センサーの回転、軸の向き (反転/入替)、スクロール動作、軸スナップにはファームウェア {min} 以降が必要です。設定タブからファームウェアを更新してください。",

  "settings.pollingTitle": "8000Hz ポーリングレート",
  "settings.pollingDescription":
    "8000Hz ポーリングレートを有効にすると応答が速くなりますが、ホスト側の CPU 使用率が上がる場合があります。変更の適用にはキーボードの再起動が必要です。この設定は全プロフィール共通です。",
  "settings.restartTitle": "キーボードを再起動",
  "settings.restartDescription":
    "キーボードが切断・再接続されます。キーボードの設定は変更されません。",
  "settings.restartButton": "キーボードを再起動",
  "settings.bootloaderTitle": "ブートローダーモードに入る",
  "settings.bootloaderDescription":
    "ファームウェアが対応していれば、キーボードが再起動してブートローダーモードに入ります。キーボードの設定は変更されません。",
  "settings.bootloaderButton": "ブートローダーモードに入る",
  "settings.factoryTitle": "工場出荷状態にリセット",
  "settings.factoryDescription":
    "ファームウェアで定義された工場出荷時の設定に戻します。全てのユーザーデータと設定が失われます。",
  "settings.factoryButton": "工場出荷状態にリセット",
  "settings.factoryConfirmTitle": "工場出荷状態にリセットしますか?",
  "settings.factoryConfirmDescription":
    "本当にキーボードを工場出荷状態にリセットしますか?",
  "settings.cancel": "キャンセル",
  "settings.languageTitle": "言語",
  "settings.languageDescription":
    "設定ツールの表示言語です。すぐに反映され、このデバイスに保存されます。",
  "settings.languageLabel": "表示言語",

  "firmware.title": "ファームウェア",
  "firmware.current": "現在のバージョン: {version}",
  "firmware.checking": "更新を確認しています...",
  "firmware.latest": "最新バージョン: {version}",
  "firmware.newAvailable": "新しいバージョンがあります",
  "firmware.upToDate": "ファームウェアは最新です。",
  "firmware.noBuild": "{name} 用のファームウェアビルドがありません。",
  "firmware.checkFailed": "更新の確認に失敗しました。",
  "firmware.retry": "再試行",
  "firmware.webUsb":
    "ファームウェアの更新には WebUSB が必要です。Chromium ベースのブラウザ (Chrome、Edge など) を使ってください。",
  "firmware.update": "ファームウェアを更新",

  "dfu.title": "ファームウェア更新",
  "dfu.versionRange": "- {current} から {latest} へ",
  "dfu.preparing": "GitHub から最新のファームウェアをダウンロードしています...",
  "dfu.selectBody1":
    "キーボードが DFU ブートローダーモードで再起動しています。「DFU デバイスを選択」をクリックし、DFU デバイス (例: 「STM32 BOOTLOADER」や「AT32 DFU」、VID 0x2E3C/0x0483、PID 0xDF11) を選択してください。複数の DFU デバイスが表示される場合は、キーボードの再起動時に現れたものを選んでください。",
  "dfu.selectBody2":
    "Windows では DFU デバイスに WinUSB ドライバーが必要です (Zadig で導入できます)。この処理中はキーボードが設定ツールから切断されますが正常です。DFU デバイスの選択を {seconds} 秒間待ちます。",
  "dfu.cancel": "キャンセル",
  "dfu.selectDevice": "DFU デバイスを選択",
  "dfu.connecting": "接続しています...",
  "dfu.readyBody":
    "DFU デバイスに接続しました。{name} に {size} のファームウェアを書き込む準備ができました。",
  "dfu.verifyTitle": "DFU デバイスを確認してください",
  "dfu.confirmLabel":
    "この DFU デバイスが更新対象の「{name}」キーボードのものであることを確認しました。",
  "dfu.doNotDisconnect": "書き込み中はキーボードを切断しないでください。",
  "dfu.flash": "ファームウェアを書き込む",
  "dfu.doneTitle": "ファームウェアの更新が完了しました。",
  "dfu.doneBody":
    "キーボードが新しいファームウェアで再起動しています。このダイアログを閉じて、キーボードを再接続してください。",
  "dfu.close": "閉じる",
  "dfu.errorBody":
    "キーボードが反応しなくなった場合は、一度抜いて挿し直してから再試行してください。Windows では DFU デバイスに WinUSB ドライバーが割り当てられていることを確認してください。",
  "dfu.tryAgain": "再試行",
  "dfu.disconnected": "DFU デバイスが切断されました。",
  "dfu.cancelled":
    "ファームウェアの更新をキャンセルしました。「{name}」は DFU ブートローダーモードのままの可能性があります: キーボードとして再接続されない場合は、一度抜いて挿し直すか (またはリセットボタンを押して) ください。",
  "dfu.timeout":
    "DFU デバイスの選択待ちがタイムアウトしました ({seconds} 秒)。キーボードが DFU ブートローダーモードで止まっている場合は、一度抜いて挿し直し (またはリセットボタンを押し) てから、もう一度「DFU デバイスを選択」をクリックしてください。Windows では DFU デバイスに WinUSB ドライバー (Zadig) が割り当てられていることを確認してください。",
  "dfu.mismatch":
    "選択された DFU デバイス ({device}) は「{name}」用ではありません。このキーボードは {expected} DFU ブートローダーを想定しています。誤ったキーボードへの書き込みを避けるため、他のデバイスを外し、「{name}」の再起動時に現れた DFU デバイスを選択してください。",
  "dfu.serialNone": "。シリアル番号は公開されていません",
  "dfu.serialSome": " (シリアル「{serial}」)",
  "dfu.identityUnknown":
    "「{name}」用の DFU ブートローダーを確認できず、DFU ブートローダーからはどのキーボードのものか判別できません",
  "dfu.identityMatch":
    "選択された DFU デバイスは「{name}」用の {expected} ブートローダーと一致していますが、ブートローダーからはこのキーボードのものと証明できません",
  "dfu.identityTail":
    "。DFU 対応キーボードを複数接続している場合は他を外して「{name}」だけを接続し、書き込み前に上記のデバイス概要を確認してください。",
  "dfu.phaseErase": "フラッシュメモリを消去しています...",
  "dfu.phaseWrite": "ファームウェアを書き込んでいます...",
  "dfu.phaseManifest": "新しいファームウェアを確定しています...",

  "toast.profileImported": "プロフィール {profile} をインポートしました。",
  "toast.profileImportInvalidJson":
    "プロフィール {profile} のインポートに失敗しました: 選択されたファイルは有効な JSON ではありません。",
  "toast.profileImportFailed":
    "プロフィール {profile} のインポートに失敗しました: {error}",
  "toast.profileExported": "プロフィール {profile} をエクスポートしました。",
  "toast.profileExportFailed":
    "プロフィール {profile} のエクスポートに失敗しました: {error}",
  "toast.modComboSlots":
    "修飾コンボを追加できませんでした: 高度なキーの空きがありません。不要な高度なキーを削除して空きを作ってから再試行してください。",
  "toast.macroNodes":
    "修飾コンボを追加できませんでした: マクロノードの空きがありません。不要なマクロを削除して空きを作ってから再試行してください。",
  "toast.tapHoldSlots":
    "タップホールドを追加できませんでした: 高度なキーの空きがありません。不要な高度なキーを削除して空きを作ってから再試行してください。",
  "toast.calibrationSaved": "キャリブレーションのしきい値を保存しました。",

  "error.pageNotFound": "ページが見つかりません",
  "error.backHome": "ホームに戻る",

  "performance.selectAll": "すべて選択",
  "performance.deselectAll": "選択をすべて解除",
  "performance.showKeymap": "キーマップを表示",
  "performance.resetSelected": "選択をリセット",
  "performance.actuationPointTitle": "アクチュエーションポイント",
  "performance.actuationPointDescription":
    "キーの押下と解放が検出される距離を設定します。",
  "performance.actuationPointDescriptionRt":
    "Rapid Trigger が有効・無効になる距離を設定します。",
  "performance.rtSensitivityTitle": "Rapid Trigger 感度",
  "performance.rtSensitivityDescription":
    "Rapid Trigger がキーの押下・解放を検出するために必要な最小の移動距離を設定します。",
  "performance.rtPressTitle": "Rapid Trigger 押下感度",
  "performance.rtPressDescriptionSeparated":
    "Rapid Trigger がキーの押下を検出するために必要な最小の移動距離を設定します。",
  "performance.rtReleaseTitle": "Rapid Trigger 解放感度",
  "performance.rtReleaseDescription":
    "Rapid Trigger がキーの解放を検出するために必要な最小の移動距離を設定します。",
  "performance.enableRtTitle": "Rapid Trigger を有効化",
  "performance.enableRtDescription":
    "Rapid Trigger は絶対位置ではなくキーの移動量に基づいて押下・解放を検出します。アクチュエーションポイントで有効・無効になります。",
  "performance.separateSensitivityTitle": "押下・解放の感度を分ける",
  "performance.separateSensitivityDescription":
    "キーの押下と解放の感度を個別に設定します。",
  "performance.continuousTitle": "Continuous Rapid Trigger",
  "performance.continuousDescription":
    "アクチュエーションポイントではなく、キーが完全に戻されたときに Rapid Trigger を無効化します。",
  "performance.continuousAbbreviation": "C",

  "advkeys.createMenu.cancel": "キャンセル",
  "advkeys.createMenu.continue": "続行",
  "advkeys.createMenu.selectKeysPlural":
    "{title}に割り当てるキーを{numKeys}つ選択してください。",
  "advkeys.createMenu.selectKeysSingle":
    "{title}に割り当てるキーを{numKeys}つ選択してください。",
  "advkeys.createMenu.keyLabel": "キー {index}",
  "advkeys.createMenu.assign": "割り当て",
  "advkeys.deleteDialog.title": "この{title}バインドを削除しますか?",
  "advkeys.deleteDialog.description":
    "このバインドを削除してもよろしいですか?",
  "advkeys.deleteDialog.cancel": "キャンセル",
  "advkeys.deleteDialog.remove": "削除",
  "advkeys.mainMenu.addTitle": "Advanced Keyを追加",
  "advkeys.mainMenu.activeTitle": "アクティブなAdvanced Key ({count}/{total})",
  "advkeys.mainMenu.empty": "アクティブなAdvanced Keyがありません...",
  "advkeys.activeBinding.edit": "編集",
  "advkeys.activeBinding.delete": "削除",
  "advkeys.configMenu.loading": "読み込み中...",
  "advkeys.configMenu.done": "完了",
  "advkeys.configMenu.delete": "削除",
  "advkeys.tickRate.description":
    "Tick Rateは、Advanced Keyが実行する2つの連続したアクション間の遅延を決定します。例えば、タップアクションはキーの押下と解放を連続して行います。Tick Rateが低いほど遅延は少なくなりますが、ゲームやアプリケーションが入力の処理に追いつけない場合、入力が欠落する可能性があります。",
  "advkeys.tickRate.title": "Tick Rate",
  "advkeys.tickRate.note":
    "Tick Rateはプロファイルごとに設定され、Dynamic Keystroke、Tap-Hold、Macroキーにのみ影響します。",
  "advkeys.keyTester.pressed": "押されたキー",
  "advkeys.keyTester.released": "離されたキー",
  "advkeys.tabs.bindings": "バインド",
  "advkeys.tabs.advanced": "詳細設定",
  "advkeys.tabs.keyTester": "キーテスター",
  "advkeys.tabs.performance": "パフォーマンス",
  "advkeys.toggle.configureTitle": "Toggleバインドの設定",
  "advkeys.toggle.configureDescription":
    "キーのToggleアクションにバインドを割り当てます。",
  "advkeys.toggle.tappingTermTitle": "Tapping Term",
  "advkeys.toggle.tappingTermDescription":
    "通常のキー動作を行うためにキーを押し続ける時間を設定します。",
  "advkeys.tapHold.configureTitle": "Tap-Holdバインドの設定",
  "advkeys.tapHold.configureDescription":
    "キーのタップアクションとホールドアクションにバインドを割り当てます。",
  "advkeys.tapHold.tapLabel": "Tap",
  "advkeys.tapHold.holdLabel": "Hold",
  "advkeys.tapHold.holdOnOtherKeyPressTitle": "Hold on Other Key Press",
  "advkeys.tapHold.holdOnOtherKeyPressDescription":
    "他のTap-Hold以外のキーが押された場合、すぐにホールドアクションを実行します。",
  "advkeys.tapHold.tappingTermTitle": "Tapping Term",
  "advkeys.tapHold.tappingTermDescription":
    "ホールドアクションを行うためにキーを押し続ける時間を設定します。",
  "advkeys.nullBind.configureTitle": "Null Bind解決動作の設定",
  "advkeys.nullBind.configureDescription":
    "両方のキーが同時に押されたときにNull Bindがキー入力を解決する方法を選択します。",
  "advkeys.nullBind.info": "情報",
  "advkeys.nullBind.alternativeBehaviorTitle":
    "Alternative Fully Pressed Behavior",
  "advkeys.nullBind.alternativeBehaviorDescription":
    "キーが同時に完全に押された場合に解決動作をバイパスして両方のキー入力を登録するには、このオプションを有効にします。",
  "advkeys.nullBind.rapidTriggerTitle": "Rapid Triggerを有効化",
  "advkeys.nullBind.rapidTriggerDescription":
    "Rapid Triggerがキー入力を登録したときのみキーを比較するにはRapid Triggerを有効にします。追加のRapid TriggerオプションはPerformanceタブで利用できます。",
  "advkeys.nullBind.actuationPointTitle": "Actuation Point",
  "advkeys.nullBind.actuationPointDescription":
    "Null Bindが有効になるActuation Pointを設定します。",
  "advkeys.nullBind.bottomOutPointTitle": "Bottom Out Point",
  "advkeys.nullBind.bottomOutPointDescription":
    "キーが完全に押されたとみなされるActuation Pointを設定します。",
  "advkeys.macro.configureTitle": "Macroアクションの設定",
  "advkeys.macro.configureDescription":
    "キーが押されたときにトリガーされるアクションのシーケンスを作成します。右側のメニューを使って各アクションにバインドを割り当てます。",
  "advkeys.macro.add": "追加",
  "advkeys.macro.empty": "Macroアクションがありません...",
  "advkeys.macro.actionLabel": "アクション",
  "advkeys.macro.delayLabel": "遅延",
  "advkeys.macro.delete": "削除",
  "advkeys.dks.configureTitle": "DKSバインドの設定",
  "advkeys.dks.configureDescription":
    "右側のメニューを使ってバインドを割り当てます。タップアクションの場合はプラスアイコンを一度クリックします。ホールドアクションの場合はプラスアイコンをクリックして、好みの動作に合わせて目的のキー位置までドラッグします。",
  "advkeys.dks.actuationPointTitle": "Actuation Point",
  "advkeys.dks.actuationPointDescription":
    "「Key press」と「Key release」アクションのActuation Pointを設定します。",
  "advkeys.dks.bottomOutPointTitle": "Bottom Out Point",
  "advkeys.dks.bottomOutPointDescription":
    "「Key fully pressed」と「Key released from fully pressed」アクションのActuation Pointを設定します。",
  "advkeys.dks.rapidTriggerNote":
    "Dynamic KeystrokeキーではRapid Triggerは自動的に無効になります。",
  "advkeys.dks.deleteAction": "アクションを削除",
  "advkeys.type.nullBindTitle": "Null Bind",
  "advkeys.type.nullBindDescription":
    "2つのキーを監視し、選択した動作に従って登録します。",
  "advkeys.type.dksTitle": "Dynamic Keystroke",
  "advkeys.type.dksDescription":
    "1つのキーに最大4つのバインドを割り当てます。各バインドはキーの位置に基づく4つの異なるアクションで設定できます。",
  "advkeys.type.tapHoldTitle": "Tap-Hold",
  "advkeys.type.tapHoldDescription":
    "キーがタップされたかホールドされたかに応じて異なるバインドを登録します。",
  "advkeys.type.toggleTitle": "Toggle",
  "advkeys.type.toggleDescription":
    "キーの押下状態と解放状態を切り替えます。キーを押し続けると通常のキー動作になります。",
  "advkeys.type.macroTitle": "Macro",
  "advkeys.type.macroDescription":
    "キーが押されたときに設定可能なアクションのシーケンスを実行します。",
  "advkeys.unknownTitle": "不明 ({value})",
  "advkeys.unknownDescription":
    "この Advanced Key の種類は認識されません。",
  "advkeys.nullBindBehavior.lastTitle": "最後の入力を優先",
  "advkeys.nullBindBehavior.lastDescription":
    "最後に押されたキーを有効にします。",
  "advkeys.nullBindBehavior.primaryTitle": "絶対優先 (キー 1)",
  "advkeys.nullBindBehavior.primaryDescription":
    "キー 1 をキー 2 より優先します。",
  "advkeys.nullBindBehavior.secondaryTitle": "絶対優先 (キー 2)",
  "advkeys.nullBindBehavior.secondaryDescription":
    "キー 2 をキー 1 より優先します。",
  "advkeys.nullBindBehavior.neutralTitle": "ニュートラル",
  "advkeys.nullBindBehavior.neutralDescription":
    "どちらのキーも有効になりません。",
  "advkeys.nullBindBehavior.distanceTitle":
    "Distance Priority (Rappy Snappy)",
  "advkeys.nullBindBehavior.distanceDescription":
    "より深く押し込まれた方のキーを有効にします。",
  "advkeys.dks.headerPress": "キー押下",
  "advkeys.dks.headerFullyPressed": "キー完全押下",
  "advkeys.dks.headerReleaseFromFully": "完全押下からのキー解放",
  "advkeys.dks.headerRelease": "キー解放",
  "advkeys.macro.actionTap": "Tap",
  "advkeys.macro.actionPress": "Press",
  "advkeys.macro.actionRelease": "Release",

  "gamepad.setup.title": "コントローラーバインドの設定",
  "gamepad.setup.description":
    "ゲームパッドボタンをキーボードに割り当てます。",
  "gamepad.setup.keyboardEnabledTitle": "キーボード入力を有効化",
  "gamepad.setup.keyboardEnabledDescription":
    "ゲームパッド入力と一緒にキーボード入力の送信を許可します。",
  "gamepad.setup.overrideTitle": "Gamepad Override",
  "gamepad.setup.overrideDescription":
    "ゲームパッドボタンに割り当てられたキーのキーボード入力を無効化します。",
  "gamepad.menu.setup": "セットアップ",
  "gamepad.menu.analog": "アナログ",
  "gamepad.menu.xinputDisabled": "XInput インターフェースは無効です",
  "gamepad.menubar.xinputTitle": "XInput インターフェースを有効化",
  "gamepad.menubar.xinputTooltip":
    "キーボードをゲームパッド入力用の Xbox コントローラーとして認識できるようにします。変更を適用するにはキーボードを再起動してください。この設定はすべてのプロファイルに適用されます。",
  "gamepad.analog.title": "アナログカーブの設定",
  "gamepad.analog.description":
    "キーボードのアナログ値をゲームパッドのアナログ入力に変換する方法を変更します。アナログカーブを手動で調整するか、以下からプリセットを選択できます。これらの設定はジョイスティックとトリガーの両方に影響します。",
  "gamepad.analog.squareTitle": "スクエアジョイスティックモード",
  "gamepad.analog.squareDescription":
    "ジョイスティックの円形の可動範囲制限を取り除き、フルレンジで操作できるようにします。",
  "gamepad.analog.snappyTitle": "スナッピージョイスティック",
  "gamepad.analog.snappyDescription":
    "対向するジョイスティック軸を合成する代わりに大きい方のアナログ値を採用し、応答性の高い操作にします。",
  "gamepad.analogCurve.startDeadzone": "キー始点デッドゾーン",
  "gamepad.analogCurve.startDeadzoneTooltip":
    "ゲームパッドのアナログ入力は送信されません。",
  "gamepad.analogCurve.endDeadzone": "キー終点デッドゾーン",
  "gamepad.analogCurve.endDeadzoneTooltip":
    "ゲームパッドのアナログ入力が最大値で送信されます。ジョイスティックでは角度が直近の45度にスナップし、D-Pad のように動作します。",
  "gamepad.analogCurve.analogValueLabel": "アナログ値",
  "gamepad.analogCurve.distanceLabel": "キー押下距離",
  "gamepad.analogCurve.presetLinear": "リニア",
  "gamepad.analogCurve.presetAggressive": "アグレッシブ",
  "gamepad.analogCurve.presetSlow": "スロー",
  "gamepad.analogCurve.presetSmooth": "スムーズ",
  "gamepad.analogCurve.presetStep": "ステップ",
  "gamepad.analogCurve.presetInstant": "インスタント",
  "gamepad.analogCurve.presetDigital": "デジタル",

  "calibration.warningBadge": "警告",
  "calibration.warningTooltip":
    "このタブはキーボードから高頻度でデータを取得するため、パフォーマンスに影響する場合があります。パフォーマンスが重要な操作を行う際は、このタブを閉じるか他のタブに切り替えてください。",
  "calibration.saveBottomOutTitle": "Save Bottom Out Threshold",
  "calibration.saveBottomOutDescription":
    "一定時間操作がないときにキーごとの bottom-out しきい値を定期的に保存し、次回起動時に復元します。保存された値は再キャリブレーション時のみクリアされます。この設定はすべてのプロファイルに共通で適用されます。",
  "calibration.initialNoiseFloorTitle": "Initial Noise Floor",
  "calibration.initialNoiseFloorDescription":
    "Initial Noise Floor は、キーが静止状態にあるときの推定アナログ値です。デッドゾーンを防ぐため、すべてのキーの静止時の実際のアナログ読み値より少し高めに設定してください。変更の適用にはキーボードの再キャリブレーションが必要です。この設定はすべてのプロファイルに共通で適用されます。",
  "calibration.initialBottomOutTitle": "Initial Bottom Out Threshold",
  "calibration.initialBottomOutDescription":
    "Initial Bottom Out Threshold は、キーを最後まで押し込んだときのアナログ値の推定変化量です。デッドゾーンを防ぐため、キーを押し込んだときの実際のアナログ読み値の変化量より少し低めに設定してください。変更の適用にはキーボードの再キャリブレーションが必要です。この設定はすべてのプロファイルに共通で適用されます。",
  "calibration.recalibrate": "再キャリブレーション",
  "calibration.saveCurrentThreshold": "現在のしきい値を保存",
  "calibration.pressedKeys": "押されているキー",
  "calibration.releasedKeys": "離されているキー",

  "theme.toggle": "テーマを切り替え",
  "theme.light": "ライト",
  "theme.dark": "ダーク",
  "theme.system": "システム",
}

export type I18nKey = keyof Dictionary

/**
 * Look up a display string for the current language. When called during
 * component render, the result updates reactively on language change.
 * `{name}`-style placeholders are filled from `vars`.
 */
export function t(key: I18nKey, vars?: Record<string, string | number>): string {
  const dictionary = getLocale() === "ja" ? ja : en
  let text: string = dictionary[key] ?? en[key]
  if (vars) {
    for (const [name, value] of Object.entries(vars)) {
      text = text.replaceAll(`{${name}}`, String(value))
    }
  }
  return text
}
