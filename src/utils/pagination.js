// ===== src/utils/pagination.js =====
const { PAGINATION } = require('../config/constants');

class Pagination {
    static getPaginationParams(query) {
        const page = parseInt(query.page) || PAGINATION.DEFAULT_PAGE;
        const limit = Math.min(
            parseInt(query.limit) || PAGINATION.DEFAULT_LIMIT,
            PAGINATION.MAX_LIMIT
        );
        const skip = (page - 1) * limit;

        return { page, limit, skip };
    }

    static getPaginationData(totalItems, page, limit) {
        const totalPages = Math.ceil(totalItems / limit);
        const hasNext = page < totalPages;
        const hasPrev = page > 1;

        return {
            page,
            limit,
            totalPages,
            totalItems,
            hasNext,
            hasPrev
        };
    }
}

module.exports = Pagination;
