# PhoneScoutNA
Get instant, detailed loss prevention information for any North American (+1) phone number with data sourced directly from the CNAC and NANPA.

# Features
- Search by number to get ratecenter, exchange, prefix type (ILEC/CLEC/RBOC/Reseller), precise location, CLLI, and line type, with complete coverage of the United States and Canada.
- Detailed results including latitude and longitude geocoded to the central office serving the number.
- Absolute accuracy - data is sourced directly from the CNAC and NANPA, and I strive to update it bi-yearly.
- API access for easy integration with your existing systems.

# Example

GET http://localhost:8080/lookup/+14164385639

```json
{
   "NPA":"416",
   "NXX":"438",
   "Thousands":"",
   "State":"ON",
   "Company":"Bell Canada",
   "OCN":"8051",
   "Ratecenter":"Toronto",
   "CLLI":"TOROON50DS0",
   "Assign Date":"00/00/0000",
   "Prefix Type":"ICO",
   "Switch Name":"",
   "Switch Type":"Northern Telecom DMS100 (Digital) Host",
   "LATA":"888",
   "Country":"CA"
}
```
