var ctm = ctm || {};

/**
 * search
 *
 * a) Filters the displayed vehicles by line numbers
 * b) TODO Offers a list of addresses matching the needle.
 */
ctm.search = function search(value) {
		if (parseInt(value, 10) != value) {
			  console.log("Only numbers can be entered at the moment.", value);
				return;
		}
		ctm.refresh(ctm.refreshRate, parseInt(value, 10));
};
