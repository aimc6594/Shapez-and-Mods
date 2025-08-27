const METADATA = {
	id: "buyChunks",
	version: "1.0.2",
	minimumGameVersion: ">=1.5.0",

	name: "Buy Chunks",
	description: "Need to buy chunks before to build on them.",
	website: "https://github.com/NatNgs/shapez-mods",
	author: "NatNgs",
	settings: {},
	doesNotAffectSavegame: false,

	// SkUpdate
	modId: '1992302',
}

class BuyChunksHUD extends shapez.BaseHUDPart {
	initialize() {
		this.root.camera.downPreHandler.add(this.onMouseDown, this)
	}
	createElements() {}
	drawOverlays(graphics) {
		if(!this.root.camera.getIsMapOverlayActive())
			return

		if(!this.root.app.mousePosition)
			return

		const {x, y} = this.getChunkOnMouse()
		const modData = this.root.buyChunksData

		if(!modData.isChunkAvailableToPurchase(x, y)) {
			// Can't buy: do not show price
			return
		}

		const {shape: shape, cost: cost} = modData.getPriceOfChunk(x, y)
		const isAffordable = modData.canAffordChunk(x, y)

		// Chunk origin is either one of the corners of the chunk
		const chunkOrigin = this.root.camera.worldToScreen(new shapez.Vector(x * shapez.globalConfig.mapChunkSize * shapez.globalConfig.tileSize, y * shapez.globalConfig.mapChunkSize * shapez.globalConfig.tileSize))
		const visibleChunkSize = new shapez.Vector(shapez.globalConfig.mapChunkSize * shapez.globalConfig.tileSize, shapez.globalConfig.mapChunkSize * shapez.globalConfig.tileSize).multiplyScalar(this.root.camera.zoomLevel)
		const chunkCenter = chunkOrigin.add(visibleChunkSize.divideScalar(2))

		// Save previous graphic context
		graphics.context.save()

		// Fill background color: red if cannot afford, green if can afford
		graphics.context.fillStyle = (isAffordable) ? "#22DD22" : "#DD2222"
		graphics.context.fillRect(chunkOrigin.x, chunkOrigin.y, visibleChunkSize.x, visibleChunkSize.y)

		// Draw the shape to be used, in the middle-top of the chunk
		new shapez.ShapeItem(this.root.shapeDefinitionMgr.getShapeFromShortKey(shape)).drawItemCenteredClipped(chunkCenter.x, chunkCenter.y - visibleChunkSize.y/4, graphics, visibleChunkSize.y*(2/5))

		// Draw the price, in the middle-bottom of the chunk
		const inStock = this.root.hubGoals.getShapesStoredByKey(shape)
		graphics.context.fillStyle = "white"
		graphics.context.textAlign = "center"
		graphics.context.textBaseline = "top"
		if(isAffordable && inStock > 0) {
			// If can afford: show the price
			graphics.context.font = "bold " + Math.floor(visibleChunkSize.x / 4) + "px GameFont"
			graphics.context.fillText(shapez.formatBigNumber(cost), chunkCenter.x, chunkCenter.y + visibleChunkSize.y/6)
		} else {
			// If can't afford: show the price and below how much more are needed
			graphics.context.font = "bold " + Math.floor(visibleChunkSize.x / 5) + "px GameFont"
			graphics.context.fillText(shapez.formatBigNumber(cost), chunkCenter.x, chunkCenter.y)

			graphics.context.font = Math.floor(visibleChunkSize.x / 7) + "px GameFont"
			graphics.context.fillText('(' + shapez.formatBigNumber(cost - inStock) + ')', chunkCenter.x, chunkCenter.y + visibleChunkSize.y/4)
		}

		// Restore previous graphic context
		graphics.context.restore()
	}
	getChunkOnMouse() {
		const mouseLocation = this.root.camera.screenToWorld(this.root.app.mousePosition)

		return {
			x: Math.floor(mouseLocation.x / shapez.globalConfig.tileSize / shapez.globalConfig.mapChunkSize),
			y: Math.floor(mouseLocation.y / shapez.globalConfig.tileSize / shapez.globalConfig.mapChunkSize)
		}
	}
	onMouseDown() {
		if(!this.root.camera.getIsMapOverlayActive()) {
			return
		}
		const chunkHovered = this.getChunkOnMouse()
		const buyChunksData = this.root.buyChunksData

		if(buyChunksData.isChunkAvailableToPurchase(chunkHovered.x, chunkHovered.y)) {
			if(buyChunksData.canAffordChunk(chunkHovered.x, chunkHovered.y)) {
				buyChunksData.doBuyChunk(chunkHovered.x, chunkHovered.y)
				this.root.app.sound.playUiSound(shapez.SOUNDS.uiClick)
			} else {
				this.root.app.sound.playUiSound(shapez.SOUNDS.uiError)
			}
		}
	}
	update() {}
}

function toChunkKey(x, y) {
	return x + ' ' + y
}
function fromChunkKey(xy) {
	return xy.split(' ').map(parseInt)
}
function get4CornersComplexity(topRight, bottomRight, bottomLeft, topLeft) {
	if(topRight === topLeft) {
		if(topRight === bottomRight && topRight === bottomLeft) {
			// Full same shape
			return (bottomRight ? 1 : 0)
		} else if(bottomRight === bottomLeft) {
			// Half top + Half bottom
			return (topRight ? 1 : 0) + (bottomRight ? 1 : 0)
		} else {
			// Half top + bottomLeft + bottomRight
			return (topRight ? 1 : 0) + (bottomLeft ? 1 : 0) + (bottomRight ? 1 : 0)
		}
	} else if(topRight === bottomRight) {
		if(topLeft === bottomLeft) {
			// Half left + Half right
			return (bottomRight ? 1 : 0) + (bottomLeft ? 1 : 0)
		} else {
			// Half right + topLeft + bottomLeft
			return (bottomLeft ? 1 : 0) + (topLeft ? 1 : 0) + (bottomRight ? 1 : 0)
		}
	} else if(topLeft === bottomLeft) {
		// Half left + topRight + bottomRight
		return (bottomRight ? 1 : 0) + (topRight ? 1 : 0) + (bottomLeft ? 1 : 0)
	} else if(bottomRight === bottomLeft) {
		// Half bottom + topRight + topLeft
		return (topRight ? 1 : 0) + (topLeft ? 1 : 0) + (bottomRight ? 1 : 0)
	}
	return (topRight ? 1 : 0) + (topLeft ? 1 : 0) + (bottomRight ? 1 : 0) + (bottomLeft ? 1 : 0)
}

/**
 * @param {str} shape
 * @returns Number between 1 (not complex) and 128 (as complex as a random shape)
 */
const cachedShapesComplexity = {}
function getShapeComplexity(shape) {
	if(shape in cachedShapesComplexity)
		return cachedShapesComplexity[shape]

	// 'shape' is like RpRpRpRp:CwCwCwCw:CuCw--Rp:----RpRp
	const layers = shape.split(':')
	let totalComplexity = 0
	for(const layer of layers) {
		const corners = layer.split('')
		let shapesCount = 0
		let colorsCount = 0
		for(let i=0; i<corners.length; i++) {
			if(corners[i] === '-' || corners[i] === 'u') {
				corners[i] = ''
			}
			if( (i%2)===0 && corners[i]) {
				shapesCount += 1
			} else if( (i%2)===1 && corners[i]) {
				colorsCount += 1
			}
		}

		const [TopRightShape, TopRightColor, BottomRightShape, BottomRightColor, BottomLeftShape, BottomLeftColor, TopLeftShape, TopLeftColor] = corners
		const shapeComplexity = get4CornersComplexity(TopRightShape, BottomRightShape, BottomLeftShape, TopLeftShape)
		const colorComplexity = get4CornersComplexity(TopRightColor, BottomRightColor, BottomLeftColor, TopLeftColor)

		totalComplexity += (shapeComplexity * shapesCount) + (colorComplexity * colorsCount)
	}

	cachedShapesComplexity[shape] = totalComplexity
	console.debug('shapesComplexity', cachedShapesComplexity)
	return totalComplexity
}

class BuyChunksData extends shapez.BasicSerializableObject {
	static getId() {
		return "buyChunksData"
	}
	static getSchema() {
		return {
			ownedChunks: shapez.types.array(shapez.types.string)
		}
	}

	constructor() {
		super()
		this.ownedChunksMap = {}

		// set starting chunks as owned
		this.doBuyChunk(-1, -1, true)
		this.doBuyChunk(-1,  0, true)
		this.doBuyChunk( 0, -1, true)
		this.doBuyChunk( 0,  0, true)
	}

	serialize() {
		this.ownedChunks = []
		for(const key in this.ownedChunksMap) {
			this.ownedChunks.push(key)
		}
		console.log('buyChunks:serialize', this)
		return super.serialize()
	}
	deserialize(e, t = null) {
		super.deserialize(e, t)

		if(this.ownedChunks) {
			this.ownedChunks.forEach((xy)=>this.ownedChunksMap[xy] = true)
		} else {
			console.warn(e, t)
		}
	}

	isChunkOwned(x, y) {
		return this.ownedChunksMap[toChunkKey(x, y)]
	}
	isTileOwned(x, y) {
		return this.isChunkOwned(Math.floor(x / shapez.globalConfig.mapChunkSize), Math.floor(y / shapez.globalConfig.mapChunkSize))
	}

	/** Checks that current cell is not owned and at least one of the surrounding chunks is owned */
	isChunkAvailableToPurchase(x, y) {
		return !this.isChunkOwned(x, y) &&
			 ( this.isChunkOwned(x + 1, y)
			|| this.isChunkOwned(x - 1, y)
			|| this.isChunkOwned(x, y + 1)
			|| this.isChunkOwned(x, y - 1))
	}

	/**
	 * @param {int} x
	 * @param {int} y
	 * @returns {{shape: string, cost: int}}
	 */
	getPriceOfChunk(x, y) {
		x = Math.floor(Math.abs(x >= 0 ? x+1 : x))
		y = Math.floor(Math.abs(y >= 0 ? y+1 : y))
		const shapeId = Math.min(x, y) - 1
		const dist = Math.max(x, y) - shapeId
		const lvlDefs = this.root.gameMode.getLevelDefinitions()
		const currentlyOwned = Object.entries(this.ownedChunksMap).length
		const shape = (shapeId < lvlDefs.length) ? lvlDefs[shapeId].shape : this.root.hubGoals.computeFreeplayShape((shapeId - lvlDefs.length) % lvlDefs.length).cachedHash
		const shapeComplexity = getShapeComplexity(shape)

		return {
			shape: shape,
			cost: Math.round( (100+currentlyOwned)*dist / shapeComplexity)
		}
	}
	canAffordChunk(x, y) {
		const price = this.getPriceOfChunk(x, y)
		return this.root.hubGoals.getShapesStoredByKey(price.shape) >= price.cost
	}
	doBuyChunk(x, y, free = false) {
		if(!free) {
			if(!this.canAffordChunk(x, y)) {
				return false
			}

			const {shape, cost} = this.getPriceOfChunk(x, y)
			this.root.hubGoals.takeShapeByKey(shape, cost)

			// Force recompute graphics
			this.root.map.getChunk(x, y, true).markDirty()
			if(!this.isChunkOwned(x-1, y)) this.root.map.getChunk(x-1, y, true).markDirty()
			if(!this.isChunkOwned(x+1, y)) this.root.map.getChunk(x+1, y, true).markDirty()
			if(!this.isChunkOwned(x, y-1)) this.root.map.getChunk(x, y-1, true).markDirty()
			if(!this.isChunkOwned(x, y+1)) this.root.map.getChunk(x, y+1, true).markDirty()
		}
		this.ownedChunksMap[toChunkKey(x, y)] = true
		return true
	}
}

class Mod extends shapez.Mod {
	init() {
		this.signals.gameInitialized.add((e => {
			e.buyChunksData = new BuyChunksData,
			e.buyChunksData.root = e
		}))

		this.signals.gameSerialized.add((e, t) => {
			t.modExtraData.buyChunksData = e.buyChunksData.serialize()
		})

		this.signals.gameDeserialized.add(((gameData, saveData) => {
			if(saveData.modExtraData['buy-land-data'] && saveData.modExtraData['buy-land-data'].ownedChunks) {
				saveData.modExtraData.buyChunksData = saveData.modExtraData.buyChunksData || {}
				saveData.modExtraData.buyChunksData.ownedChunks = saveData.modExtraData.buyChunksData.ownedChunks || []

				saveData.modExtraData['buy-land-data'].ownedChunks.map(xy=>saveData.modExtraData.buyChunksData.ownedChunks.push(xy[0] + ' ' + xy[1]))
			}

			gameData.buyChunksData.deserialize(saveData.modExtraData.buyChunksData)
			gameData.buyChunksData.root = gameData
		}))

		this.modInterface.replaceMethod(shapez.GameLogic, "checkCanPlaceEntity", (function($super, [gameData, tile]) {
			const tileBounds = gameData.components.StaticMapEntity.getTileSpaceBounds()

			if(tile.offset) {
				tileBounds.x += tile.offset.x
				tileBounds.y += tile.offset.y
			}

			if(!this.root.buyChunksData.isTileOwned(tileBounds.x, tileBounds.y)
				|| (tileBounds.w + tileBounds.h > 2 && (
					!this.root.buyChunksData.isTileOwned(tileBounds.x + tileBounds.w -1, tileBounds.y)
					|| !this.root.buyChunksData.isTileOwned(tileBounds.x, tileBounds.y + tileBounds.h -1)
					|| !this.root.buyChunksData.isTileOwned(tileBounds.x + tileBounds.w -1, tileBounds.y + tileBounds.h -1))))
				return false

			return $super(gameData, tile)
		}))


		// Hide unowed chunks when zoomed-out
		this.modInterface.extendClass(shapez.MapChunkView, ({$super, $old}) => ({
			// Reduce drawings to improve performance
			drawBackgroundLayer(graphics) {
				if(!this.root.buyChunksData.isChunkOwned(this.x, this.y)) {
					graphics.context.save()

					graphics.context.fillStyle = "#3b3b3b"
					graphics.context.fillRect(this.worldSpaceRectangle.x, this.worldSpaceRectangle.y, this.worldSpaceRectangle.w, this.worldSpaceRectangle.h)

					graphics.context.restore()
					return
				}

				$old.drawBackgroundLayer.call(this, graphics)
			},

			// Hide shapes under chunks not owned
			drawOverlayPatches(graphics, xOffs, yOffs, diameter) {
				if(!this.root.buyChunksData.isChunkOwned(this.x, this.y))
					return

				$old.drawOverlayPatches.call(this, graphics, xOffs, yOffs, diameter)
			},
			generateOverlayBuffer(graphics, width, height, xOffs, yOffs) {
				if(this.root.buyChunksData.isChunkOwned(this.x, this.y)) {
					return $old.generateOverlayBuffer.call(this, graphics, width, height, xOffs, yOffs)
				}

				graphics.save()

				// Hide the chunk under...
				if(this.root.buyChunksData.isChunkAvailableToPurchase(this.x, this.y)) {
					// Light transparent gray overlay is available to purchase
					$old.generateOverlayBuffer.call(this, graphics, width, height, xOffs, yOffs)
					graphics.fillStyle = "#444444DD"
				} else {
					// Dark gray overlay if not available to purchase
					graphics.fillStyle = "#333333"
				}
				graphics.fillRect(xOffs, yOffs, width, height)

				graphics.restore()
			}
		}))

		// Overlay on mouse to buy chunks
		this.modInterface.registerHudElement("buyChunks", BuyChunksHUD)
		this.modInterface.replaceMethod(shapez.GameHUD, "drawOverlays", (function($super, [graphics]) {
			this.parts.buyChunks.drawOverlays(graphics),
			$super(graphics)
		}))
	}
}
