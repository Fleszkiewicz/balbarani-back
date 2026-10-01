import Flavor from '../models/FlavorModel.js'

// Obtener todos los sabores ordenados por categoría y luego por nombre
export const getFlavors = async (req, res) => {
    try {
        const flavors = await Flavor.find().sort({ category: 1, name: 1 })
        res.json(flavors)
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener sabores', error: error.message })
    }
}

// Crear nuevo sabor asignándole nombre y categoría
export const createFlavor = async (req, res) => {
    try {
        const { name, category, available } = req.body
        const newFlavor = new Flavor({
            name,
            category: category || 'Cremas',
            available: available !== undefined ? available : true,
        })
        await newFlavor.save()
        res.status(201).json(newFlavor)
    } catch (error) {
        res.status(400).json({ message: 'Error al crear sabor', error: error.message })
    }
}

// Actualizar sabor (nombre, categoría o disponibilidad online)
export const updateFlavor = async (req, res) => {
    try {
        const { id } = req.params
        const { name, category, available } = req.body

        const updateData = {}
        if (name !== undefined) updateData.name = name
        if (category !== undefined) updateData.category = category
        if (available !== undefined) updateData.available = available

        const updatedFlavor = await Flavor.findByIdAndUpdate(
            id,
            updateData,
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

// Eliminar sabor permanentemente
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
