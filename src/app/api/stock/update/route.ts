import { google } from 'googleapis'
import { NextResponse } from 'next/server'

const spreadsheetId = process.env.GOOGLE_SHEET_ID!
const sheetName = 'Flavors'

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
})

const sheets = google.sheets({ version: 'v4', auth })

export async function GET() {
  const range = `${sheetName}!A2:Z`
  const readRes = await sheets.spreadsheets.values.get({ spreadsheetId, range })
  const rows = readRes.data.values || []

  // mapear filas a objetos
  const flavors = rows.map((row, i) => ({
    flavorId: Number(row[0]),
    productId: Number(row[1]),
    flavor: row[2],
    stock: Number(row[3]),
    purchasedQuantity: Number(row[4]),
    quantitySold: Number(row[5]),
    discountsGifts: Number(row[6]) || 0, 
    price: Number(row[7]),
  }))


  return NextResponse.json(flavors)
}

export async function POST(req: Request) {
  const body = await req.json()
const { sabor, cantidadIngresada, cantidadVendida, descuentosRegalos } = body

if (
  !sabor ||
  typeof cantidadIngresada !== 'number' ||
  typeof cantidadVendida !== 'number' ||
  typeof descuentosRegalos !== 'number'
) {
  return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
}


  // Leer todos los sabores para ubicar fila
  const range = `${sheetName}!A2:Z`
  const readRes = await sheets.spreadsheets.values.get({ spreadsheetId, range })

  const rows = readRes.data.values || []
  const filaIndex = rows.findIndex(
    (row) => row[2]?.trim().toLowerCase() === sabor.trim().toLowerCase()
  )

  if (filaIndex === -1) {
    return NextResponse.json({ error: 'Sabor no encontrado' }, { status: 404 })
  }

  // Columnas:
  // E = purchasedQuantity = índice 4
  // F = quantitySold = índice 5

  const startCol = 4
  const endCol = 6
  const celdaInicio = String.fromCharCode(65 + startCol) + (filaIndex + 2)
  const celdaFin = String.fromCharCode(65 + endCol) + (filaIndex + 2)
  const rangoActualizar = `${sheetName}!${celdaInicio}:${celdaFin}`

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: rangoActualizar,
    valueInputOption: 'RAW',
    requestBody: {
      values: [[cantidadIngresada.toString(), cantidadVendida.toString(), descuentosRegalos.toString(),]],
    },
  })

  return NextResponse.json({ ok: true })
}
