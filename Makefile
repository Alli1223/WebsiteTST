IMAGE_NAME=website-tst

run:
        docker build -t $(IMAGE_NAME) .
        docker run --rm -it --init -p 80:80 -v $(PWD)/server/database:/app/server/database $(IMAGE_NAME)
