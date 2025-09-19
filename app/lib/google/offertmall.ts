
export const OFFERTMALL_HTML = `
<!DOCTYPE html>
<html lang="sv">
<head>
    <meta charset="UTF-8">
    <title>Offert {{projektnummer}}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; color: #333; }
        .container { width: 100%; max-width: 800px; margin: 0 auto; padding: 30px; }
        .header, .footer { text-align: center; margin-bottom: 30px; }
        .header h1 { margin: 0; color: #111; }
        .header p { margin: 5px 0; color: #555; }
        .section { margin-bottom: 25px; }
        .section h2 { font-size: 1.2em; color: #005A9C; border-bottom: 2px solid #005A9C; padding-bottom: 5px; margin-bottom: 15px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; font-weight: bold; }
        .total-row td { font-weight: bold; border-top: 1px solid #ddd; }
        .summary { float: right; width: 45%; margin-top: 20px; }
        .summary table { width: 100%; }
        .summary th, .summary td { padding: 10px; }
        .summary .final-price { font-size: 1.3em; color: #005A9C; }
        .clearfix::after { content: ""; clear: both; display: table; }
        .company-details, .client-details { width: 48%; }
        .company-details { float: left; }
        .client-details { float: right; text-align: right; }
        .details-box { margin-bottom: 30px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>{{dittForetagsnamn}}</h1>
            <p>{{dinAdress}}</p>
            <p>E-post: {{dinEpost}} | Telefon: {{dittTelefonnummer}}</p>
            <p>Org.nr: {{dittOrgNr}}</p>
        </div>

        <div class="details-box clearfix">
            <div class="company-details">
                <h2>Offert</h2>
                <p><strong>Datum:</strong> {{offertdatum}}</p>
                <p><strong>Offertnummer:</strong> {{offertnummer}}</p>
                <p><strong>Giltig till:</strong> {{giltigTillDatum}}</p>
            </div>
            <div class="client-details">
                <h3>Kund</h3>
                <p>{{kundnamn}}</p>
                <p>{{kundAdress}}</p>
                <p>{{kundEpost}}</p>
            </div>
        </div>

        <div class="section">
            <p>Här med offereras följande arbeten för projekt <strong>{{projektnummer}}</strong> enligt nedan specifikation:</p>
        </div>

        {{#each sections}}
        <div class="section">
            <h2>{{title}}</h2>
            <table>
                <thead>
                    <tr>
                        <th style="width:50%;">Beskrivning</th>
                        <th style="width:15%;">Antal</th>
                        <th style="width:10%;">Enhet</th>
                        <th style="width:15%;">À-pris</th>
                        <th style="width:10%; text-align:right;">Summa</th>
                    </tr>
                </thead>
                <tbody>
                    {{#each items}}
                    <tr>
                        <td>{{description}}</td>
                        <td>{{quantity}}</td>
                        <td>{{unit}}</td>
                        <td>{{unitPrice}} kr</td>
                        <td style="text-align:right;">{{total}} kr</td>
                    </tr>
                    {{/each}}
                    <tr class="total-row">
                        <td colspan="4">Delsumma {{title}}</td>
                        <td style="text-align:right;">{{subTotal}} kr</td>
                    </tr>
                </tbody>
            </table>
        </div>
        {{/each}}

        <div class="summary">
            <table>
                <tr>
                    <td>Summa netto (självkostnad):</td>
                    <td style="text-align:right;">{{totalSelfCost}} kr</td>
                </tr>
                <tr>
                    <td>Vinstpåslag ({{profitMarginPercentage}}%):</td>
                    <td style="text-align:right;">{{profitAmount}} kr</td>
                </tr>
                <tr class="total-row">
                    <td>Summa att fakturera (exkl. moms):</td>
                    <td style="text-align:right;">{{totalExclVat}} kr</td>
                </tr>
                 <tr>
                    <td>Moms (25%):</td>
                    <td style="text-align:right;">{{vatAmount}} kr</td>
                </tr>
                <tr class="total-row final-price">
                    <td><strong>Summa att fakturera (inkl. moms):</strong></td>
                    <td style="text-align:right;"><strong>{{totalInclVat}} kr</strong></td>
                </tr>
            </table>
        </div>
        <div class="clearfix"></div>

        <div class="footer">
            <p>Tack för förtroendet!</p>
            <p>Med vänliga hälsningar,<br>{{dittNamn}}, {{dittForetagsnamn}}</p>
        </div>
    </div>
</body>
</html>
`
