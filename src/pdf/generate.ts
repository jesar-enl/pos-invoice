import "server-only";
import { Document, renderToBuffer } from "@react-pdf/renderer";
import { createElement } from "react";
import {
  type ReceiptPdfData,
  UgandaReceiptPage,
} from "./templates/UgandaReceipt";

export async function generateReceiptPdf(
  data: ReceiptPdfData,
): Promise<Buffer> {
  const document = createElement(
    Document,
    null,
    createElement(UgandaReceiptPage, { data }),
  );
  const buffer = await renderToBuffer(document);
  return Buffer.from(buffer);
}
