from bs4 import BeautifulSoup


def parse_accepted_papers(contents):
    # create a BeautifulSoup object from the HTML string
    soup = BeautifulSoup(contents, "html.parser")

    # find all the <div> tags with class="paper"
    papers = soup.find_all("div", class_="paper")

    # loop through each paper and extract the authors and title
    papers_list = []
    for paper in papers:
        # extract the author names
        authors = paper.find("span", class_="authors").text
        # extract the paper title
        title = paper.find("span", class_="title").text

        res = {
            "authors": authors,
            "title": title
        }
        papers_list.append(res)

    return papers_list
