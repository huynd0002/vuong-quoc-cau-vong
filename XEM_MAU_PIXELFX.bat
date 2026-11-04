@echo off
title Thu Vien Hieu Ung PixelFX (244 Effects) - Vuong Quoc Cau Vong
color 0b
echo =========================================================================
echo       KHO HIỆU ỨNG ĐỒNG HÀNH PIXELFX CHO GAME VUONG QUOC CAU VONG
echo =========================================================================
echo.
echo [1/2] Dang khoi dong may chu xem mau hieu ung tai cong 8090...
echo [2/2] Dang mo trinh duyet web: http://localhost:8090/gallery/
echo.
echo * Luu y: Giu nguyen cua so nay trong khi xem mau. Nhan Ctrl+C de dung.
echo =========================================================================
echo.

start http://localhost:8090/gallery/
node pixelfx-repo/tools/serve.mjs 8090
pause
