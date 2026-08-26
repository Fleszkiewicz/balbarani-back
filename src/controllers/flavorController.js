import Flavor from '../models/FlavorModel.js'

export const getFlavors = async (req, res) => {
    try {
        const flavors = await Flavor.find().sort({ name: 1 })
        res.json(flavors)
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener sabores', error: error.message })
    }
}

export const createFlavor = async (req, res) => {
    try {
        const { name, available } = req.body
        const newFlavor = new Flavor({ name, available })
        await newFlavor.save()
        res.status(201).json(newFlavor)
    } catch (error) {
        res.status(400).json({ message: 'Error al crear sabor', error: error.message })
    }
}

export const updateFlavor = async (req, res) => {
    try {
        const { id } = req.params
        const { name, available } = req.body
        
        const updatedFlavor = await Flavor.findByIdAndUpdate(
            id,
            { name, available },
            { new: true, runValidators: true }
        )
        
        if (!updatedFlavor) {
            return res.status(404).json({ message: 'Sabor no encontrado' })
        }
        
        res.json(updatedFlavor)
    } catch (error) {
        res.status(400).json({ message: 'Error al actualizar sabor', error: error.message })
    }
}

export const deleteFlavor = async (req, res) => {
    try {
        const { id } = req.params
        const deletedFlavor = await Flavor.findByIdAndDelete(id)
        
        if (!deletedFlavor) {
            return res.status(404).json({ message: 'Sabor no encontrado' })
        }
        
        res.json({ message: 'Sabor eliminado correctamente' })
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar sabor', error: error.message })
    }
}
