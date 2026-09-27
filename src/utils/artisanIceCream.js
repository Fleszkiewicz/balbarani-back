import FlavorModel from '../models/FlavorModel.js'

const PORTION_LIMITS = [
    { pattern: /1\s*kg/i, max: 4 },
    { pattern: /3\s*\/\s*4/i, max: 4 },
    { pattern: /1\s*\/\s*2/i, max: 3 },
    { pattern: /1\s*\/\s*4/i, max: 2 },
]

export const getMaxFlavorPortions = (productName = '') => {
    const match = PORTION_LIMITS.find(({ pattern }) => pattern.test(productName))
    return match?.max ?? 4
}

export const normalizeConfiguration = (configuration) => {
    if (!configuration) return null
    return JSON.stringify(configuration)
}

export const isSameCartLine = (item, productId, configuration) =>
    item.productId.toString() === productId &&
    normalizeConfiguration(item.configuration) ===
        normalizeConfiguration(configuration)

export const validateFlavorConfiguration = async (product, configuration) => {
    if (!configuration?.flavors?.length) {
        return { valid: false, message: 'Debes configurar los sabores' }
    }

    const maxPortions = getMaxFlavorPortions(product.name)
    const totalPortions = configuration.flavors.reduce(
        (sum, flavor) => sum + flavor.quantity,
        0,
    )

    if (totalPortions !== maxPortions) {
        return {
            valid: false,
            message: `Debes seleccionar exactamente ${maxPortions} porciones de sabor`,
        }
    }

    for (const { name, quantity } of configuration.flavors) {
        if (quantity <= 0) continue

        const flavor = await FlavorModel.findOne({ name, available: true })

        if (!flavor) {
            return {
                valid: false,
                message: `El sabor ${name} no está disponible`,
            }
        }
    }

    return { valid: true }
}

export const calculateLineUnitTotal = (basePrice, configuration) => {
    const extrasTotal = (configuration?.extras || []).reduce(
        (sum, extra) => sum + extra.price * extra.quantity,
        0,
    )
    return basePrice + extrasTotal
}
