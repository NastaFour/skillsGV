# 🇻🇪 Caso de Estudio: Adaptador Regional Multi-Moneda (Venezuela)

Este documento sirve como referencia arquitectónica y caso de estudio para la implementación de un adaptador de pagos multi-moneda con control cambiario e instrumentos locales (Venezuela).

---

## 🏛️ Componentes del Adaptador Regional

| Componente | Documento de Referencia | Propósito |
|---|---|---|
| **Tasa Oficial BCV** | [`bcv-integration.md`](bcv-integration.md) | Consulta con caché, persistencia en DB y fallback ante contingencias de conectividad. |
| **Pago Móvil (Manual + C2P)** | [`pago-movil-flows.md`](pago-movil-flows.md) | Validación de transacciones bancarias instantáneas (C2P con OTP o validación manual con referencia bancaria). |
| **Cashea (BNPL)** | [`cashea-bnpl.md`](cashea-bnpl.md) | Integración Buy Now Pay Later con firma HMAC-SHA256, webhook criptográfico y actualización atómica. |

---

## 🔒 Reglas Específicas del Adaptador

1. **Multi-moneda (USD / VES)**:
   - Almacenar siempre montos en centavos de divisa base y registrar la tasa BCV congelada al momento exacto de la transacción (`exchangeRate` en la orden).
2. **Detección de Fraude en Referencias Manuales**:
   - Unicidad de referencia bancaria por banco emisor en ventana móvil (ej. 30 días). Si se detecta colisión, marcar como `[🔴 POSIBLE DUPLICADO]` para revisión humana.
3. **Efectivo en Entrega**:
   - Marcado de pago en destino con confirmación de receptor y cuadre de caja por transportista/repartidor.
