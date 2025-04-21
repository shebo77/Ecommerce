class ApiFeatures {
  constructor(mongooseQuery, queryData) {
    this.mongooseQuery = mongooseQuery;
    this.queryData = queryData;
  }

  // pagination
  paginate() {
    let page = this.queryData.page * 1 || 1;
    let limit = 3;
    if (page < 1) page = 1;
    let skip = (page - 1) * limit;
    this.mongooseQuery = this.mongooseQuery.skip(skip).limit(limit);
    this.page = page;
    return this;
  }

  // filter

  filter() {
    let excludeQuery = ["page", "search", "sort", "select"];
    let filterQuery = { ...this.queryData };
    excludeQuery.forEach((e) => {
      delete filterQuery[e];
    });

    filterQuery = JSON.parse(
      JSON.stringify(filterQuery).replace(
        /(gt|gte|lt|lte)/g,
        (match) => `$${match}`
      )
    );
    this.mongooseQuery = this.mongooseQuery.find(filterQuery);
    return this;
  }

  // sort

  sort() {
    if (this.queryData.sort) {
      this.queryData.sort = this.queryData.sort.replaceAll(",", " ");
      this.mongooseQuery = this.mongooseQuery.sort(this.queryData.sort);
    }
    return this
  }



    // select

    select() {
        if (this.queryData.select) {
          this.queryData.select = this.queryData.select.replaceAll(",", " ");
          this.mongooseQuery = this.mongooseQuery.select(this.queryData.select);
        }
        return this
      }
    



      // search 
      search(fields) {
        if (this.queryData.search) {
          const searchQuery = {
            $or: fields.map((field) => ({
              [field]: { $regex: this.queryData.search, $options: "i" },
            })),
          };
          this.mongooseQuery = this.mongooseQuery.find(searchQuery);
        }
        return this;
      }




}



export default ApiFeatures
