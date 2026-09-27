import SettingModel from '../models/SettingModel.js'

//Obtener el valor del delivery (publico para la tienda)
export const getDeliveryFee = async (req, res) => {
    try {
        let setting = await SettingModel.findOne({ key: "deliveryFee" })
        if (!setting) {
            setting = await SettingModel.create({ key: 'deliveryFee', value: 0 })
        }
        res.status(200).json({ deliveryFee: Number(setting.value) || 0 })
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el costo de delivery', error: error.message })
    }
}

//Actualizar el valor del delivery (private - solo admin)
export const updateDeliveryFee = async (req, res) => {
    try {
        const { deliveryFee } = req.body
        const numFee = Number(deliveryFee)

        if (isNaN(numFee) || numFee < 0) {
            return res.status(400).json({ message: 'El costo de envio debe ser un numero positivo' })
        }
        const setting = await SettingModel.findOneAndUpdate(
            { key: 'deliveryFee' },
            { value: numFee },
            { upsert: true, new: true }
        )
        res.status(200).json({
            message: 'Costo de delivery actualizado con éxito',
            deliveryFee: Number(setting.value),
        })
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar costo de delivery', error: error.message })
    }
}