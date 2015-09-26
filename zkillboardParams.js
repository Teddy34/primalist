module.exports = 
{	url: "https://zkillboard.com/api/losses/no-attackers",
	options: {
		pastSeconds: 604800
	},
	filters: {
		/* filters are done one by one, not combined */
		corporation: [/* prima */"98161032" /*, wise "98078355"*/]
	}
};