import { NextResponse } from 'next/server';
import Papa from 'papaparse';
import crypto from 'crypto';

const PRODUCTS_CSV_URL = process.env.PRODUCTS_CSV_URL!;
const FLAVORS_CSV_URL = process.env.FLAVORS_CSV_URL!;

type ProductRow = {
  productId: string;
  brand: string;
  name: string;
  image1?: string;
  image2?: string;
  image3?: string;
  price: string;
};

type FlavorRow = {
  flavorId: string;
  productId: string;
  flavor: string;
  stock: string;
  purchasedQuantity: string;
  quantitySold: string;
  discountsGifts: string;
  totalSales: string;
  actualTotalSales: string;
};


export type ProductBasic = {
  productId: string;
  brand: string;
  name: string;
  images: string[];
  price: number;
};

export type Flavor = {
  flavorId: string;
  productId: string;
  flavor: string;
  stock: number;
  purchasedQuantity: number;
  quantitySold: number;
  discountsGifts: number;
  totalSales: number;
  actualTotalSales: number;
};

export type ProductFull = ProductBasic & {
  flavors: Flavor[];
  images: string[];
};

const cleanUrl = (url: string) => {
  if (!url) return '';
  const [protocol, rest] = url.split('://');
  if (!rest) return url.trim();
  const cleanRest = rest.replace(/\/{2,}/g, '/');
  return `${protocol}://${cleanRest}`;
};

function hashStringSync(str: string): string {
  return crypto.createHash('sha256').update(str).digest('hex');
}

export async function GET() {
  try {
    if (!PRODUCTS_CSV_URL || !FLAVORS_CSV_URL) {
  throw new Error('PRODUCTS_CSV_URL or FLAVORS_CSV_URL not defined in env');
}

    const [productsRes, flavorsRes] = await Promise.all([
  fetch(PRODUCTS_CSV_URL),
  fetch(FLAVORS_CSV_URL),
]);


    if (!productsRes.ok || !flavorsRes.ok) {
      return NextResponse.json({ error: 'Error fetching CSV data' }, { status: 502 });
    }

    const [productsCSV, flavorsCSV] = await Promise.all([
      productsRes.text(),
      flavorsRes.text(),
    ]);

    const productsRaw = Papa.parse<ProductRow>(productsCSV, {
      header: true,
      skipEmptyLines: true,
    }).data;

    const flavorsRaw = Papa.parse<FlavorRow>(flavorsCSV, {
      header: true,
      skipEmptyLines: true,
    }).data;


    const productsBasic: ProductBasic[] = productsRaw.map((p) => ({
      productId: p.productId.trim(),
      brand: p.brand,
      name: p.name,
      images: [p.image1, p.image2, p.image3]
        .filter((img): img is string => Boolean(img)) 
        .map((img) => cleanUrl(img)),

      price: Number(p.price),
    }));

    const flavors: Flavor[] = flavorsRaw.map((f) => ({
      flavorId: f.flavorId.trim(),
      productId: f.productId.trim(),
      flavor: f.flavor,
      stock: Number(f.stock),
      purchasedQuantity: Number(f.purchasedQuantity),
      quantitySold: Number(f.quantitySold),
      discountsGifts: Number(f.discountsGifts),
      totalSales: Number(f.totalSales),
      actualTotalSales: Number(f.actualTotalSales),
    }));

    const productsFull: ProductFull[] = productsBasic.map((product) => ({
      ...product,
      flavors: flavors.filter((f) => f.productId === product.productId),
    }));

        const productHash = hashStringSync(productsCSV);
    const flavorHash = hashStringSync(flavorsCSV);

    return NextResponse.json({
      products: productsFull,
      productHash,
      flavorHash,
      fetchedAt: new Date().toISOString(),
    });

  } catch (error) {
    console.error('API fetch error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
