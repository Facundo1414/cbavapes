import { google } from 'googleapis'
import { NextResponse } from 'next/server'

const spreadsheetId = process.env.GOOGLE_SHEET_ID!
const sheetName = 'Products'

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
})

const sheets = google.sheets({ version: 'v4', auth })

// Columnas esperadas en Google Sheets:
// A: productId
// B: brand
// C: name
// D-F: images
// G: price

export async function GET() {
  try {
    const range = `${sheetName}!A2:G`
    const res = await sheets.spreadsheets.values.get({ spreadsheetId, range })
    const rows = res.data.values || []

    const productos = rows.map((row, i) => ({
      productId: row[0]?.trim() ?? '',
      brand: row[1] ?? '',
      name: row[2] ?? '',
      images: [row[3], row[4], row[5]].filter(Boolean),
      price: Number(row[6]) || 0,
      flavors: [], // En este endpoint no cargamos los sabores; opcional si querés integrarlo
    }))

    return NextResponse.json({ products: productos })
  } catch (error) {
    console.error('Error al leer productos:', error)
    return NextResponse.json({ error: 'Error al leer productos' }, { status: 500 })
  }
}

// Actualizar precio y/o nombre de producto (simple ejemplo)
export async function POST(req: Request) {
  const body = await req.json()
  const { productId, name, price } = body

  if (!productId || typeof price !== 'number') {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
  }

  try {
    const range = `${sheetName}!A2:G`
    const res = await sheets.spreadsheets.values.get({ spreadsheetId, range })
    const rows = res.data.values || []

    const rowIndex = rows.findIndex((row) => row[0]?.trim() === productId.trim())
    if (rowIndex === -1) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
    }

    // G = columna 7 (índice 6)
    const updateRange = `${sheetName}!C${rowIndex + 2}:G${rowIndex + 2}`
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: updateRange,
      valueInputOption: 'RAW',
      requestBody: {
        values: [[name, '', '', '', price.toString()]],
      },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error al actualizar producto:', error)
    return NextResponse.json({ error: 'Error al actualizar producto' }, { status: 500 })
  }
}
