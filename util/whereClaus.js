class whereClaus {
    constructor(base, bigQuery) {
        this.base = base;
        this.bigQuery = bigQuery;
    }

    search(){
        const searchWord = this.bigQuery.search ? {
            name: {
                $regex: this.bigQuery.search,
                $options: 'i'
            }
        } : {}

        this.base = this.base.find({ ...searchWord })

        return this;
    }

    filter(){
        const copyQuery = { ...this.bigQuery };

        delete copyQuery["search"];
        delete copyQuery["limit"];
        delete copyQuery["page"];

        let queryStr = JSON.stringify(copyQuery);

        queryStr = queryStr.replace(/\b(gte | lte | gt | lt)\b/g, m => `$${m}`);

        const queryJson = JSON.parse(queryStr);

        this.base = this.base.find(queryJson);

        return this;
    }

    pager(resultPerPage){
        let currentPage = 1;
        if(this.bigQuery.page){
            currentPage = this.bigQuery.page * 1;
        }

        const skipVal = resultPerPage * (currentPage - 1);

        this.base = this.base.limit(resultPerPage).skip(skipVal);
        return this;
    }


}

module.exports = whereClaus;