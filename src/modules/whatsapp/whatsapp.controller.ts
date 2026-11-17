import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { WhatsappService } from './whatsapp.service';

@Controller('whatsapp')
export class WhatsappController {
  constructor(private readonly whatsapp: WhatsappService) {}

  @Get('qr')
  getQrPage(@Res() res: Response): void {
    if (this.whatsapp.isConnected) {
      res.type('html').send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <title>WhatsApp Connected - Soumadeep AI</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #0f172a; color: #f8fafc; }
            .card { background: #1e293b; padding: 2.5rem; border-radius: 1.25rem; text-align: center; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.5); max-width: 420px; border: 1px solid #334155; }
            h1 { color: #22c55e; margin-bottom: 0.5rem; font-size: 1.75rem; }
            p { color: #94a3b8; font-size: 1rem; line-height: 1.5; }
            .badge { display: inline-block; background: #15803d; color: white; padding: 0.35rem 0.85rem; border-radius: 9999px; font-size: 0.85rem; margin-bottom: 1rem; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="badge">● Online 24/7</div>
            <h1>✅ WhatsApp Connected!</h1>
            <p>Soumadeep AI is active, authenticated, and listening for personal messages.</p>
          </div>
        </body>
        </html>
      `);
      return;
    }

    if (!this.whatsapp.latestQr) {
      res.type('html').send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <title>Generating QR - Soumadeep AI</title>
          <meta http-equiv="refresh" content="4">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #0f172a; color: #f8fafc; text-align: center; }
            .card { background: #1e293b; padding: 2.5rem; border-radius: 1.25rem; max-width: 420px; border: 1px solid #334155; }
            h2 { color: #38bdf8; margin-top: 0; }
            p { color: #94a3b8; }
            .spinner { width: 40px; height: 40px; border: 4px solid #334155; border-top-color: #38bdf8; border-radius: 50%; animation: spin 1s linear infinite; margin: 1.5rem auto; }
            @keyframes spin { to { transform: rotate(360deg); } }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="spinner"></div>
            <h2>⏳ Generating QR Code...</h2>
            <p>Please wait a few seconds while WhatsApp client initializes. This page auto-refreshes.</p>
          </div>
        </body>
        </html>
      `);
      return;
    }

    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=360x360&margin=15&data=${encodeURIComponent(this.whatsapp.latestQr)}`;

    res.type('html').send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Scan WhatsApp QR - Soumadeep AI</title>
        <meta http-equiv="refresh" content="18">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #0f172a; color: #f8fafc; }
          .card { background: #1e293b; padding: 2rem; border-radius: 1.5rem; text-align: center; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); max-width: 420px; margin: 1rem; border: 1px solid #334155; }
          h2 { color: #38bdf8; margin-top: 0; font-size: 1.5rem; }
          p { color: #94a3b8; font-size: 0.95rem; line-height: 1.5; margin-bottom: 1.5rem; }
          .qr-container { background: white; padding: 1rem; border-radius: 1rem; display: inline-block; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3); }
          img { display: block; border-radius: 0.5rem; width: 280px; height: 280px; }
          .badge { display: inline-block; background: #0284c7; color: white; padding: 0.25rem 0.85rem; border-radius: 9999px; font-size: 0.8rem; margin-bottom: 1rem; font-weight: 500; }
          .footer { font-size: 0.8rem; margin-top: 1.25rem; color: #64748b; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="badge">Soumadeep AI 24/7</div>
          <h2>📲 Link Your WhatsApp</h2>
          <p>
            1. Open WhatsApp on your phone<br>
            2. Tap <b>Settings</b> ➡️ <b>Linked Devices</b><br>
            3. Tap <b>Link a Device</b> and point camera here:
          </p>
          <div class="qr-container">
            <img src="${qrUrl}" alt="WhatsApp QR Code" />
          </div>
          <div class="footer">🔄 Auto-refreshes every 18 seconds</div>
        </div>
      </body>
      </html>
    `);
  }
}
