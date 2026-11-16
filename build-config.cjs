module.exports = {
	forceRemoveNodeGypFromPkg: true,
	// Keep node-hid's package layout so the firmware reader can resolve its HIDAPI binding.
	externals: { koffi: 'commonjs koffi', 'node-hid': 'commonjs node-hid' },
	prebuilds: ['@julusian/jpeg-turbo', '@julusian/image-rs'],
}
