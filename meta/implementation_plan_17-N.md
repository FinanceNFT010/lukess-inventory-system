# [Goal Description]

Update the completion email to display the `discountCode` in a visually appealing "VIP Gift" section, remove the `headerImage` from the completed WhatsApp templates to fix the Meta API format mismatch (error 132012), and use the `'fallback'` language policy in the WhatsApp payload to fix the language matching error (error 132001).

## Proposed Changes

### lukess-landing-ecommerce
#### [MODIFY] [lib/whatsapp/send-message.ts](file:///c:/LukessHome/lukess-landing-ecommerce/lib/whatsapp/send-message.ts)
- Update the language policy from `'deterministic'` to `'fallback'`. This will fix the WhatsApp 132001 error regarding strict language matching.

#### [MODIFY] [app/api/send-email/route.ts](file:///c:/LukessHome/lukess-landing-ecommerce/app/api/send-email/route.ts)
- Update `buildCompletionEmailHtml` to conditionally render a visually attractive "VIP Gift" section (gold/black border, bold text) if `data.discountCode` exists.
- Add CTA text: "Usa este código en tu próxima compra. Válido por 3 días."

---

### lukess-inventory-system
#### [MODIFY] [lib/whatsapp.ts](file:///c:/LukessHome/lukess-inventory-system/lib/whatsapp.ts)
- Remove `headerImage: ENTREGADO_HEADER_IMAGE` from the `completed` cases in `getWhatsAppTemplate`.
- Remove the `ENTREGADO_HEADER_IMAGE` constant completely. Meta already has the image mapped statically, so dynamically sending it causes a format mismatch error (132012).

## Verification Plan

### Manual Verification
- I will first commit the landing page repository changes.
- Then I will commit the inventory system repository changes.
- Request the user to test a completed order to verify the WhatsApp template format is accepted by Meta without errors.
- Request the user to check the completion email to verify the new VIP Gift section design renders correctly and contains the `discountCode`.
