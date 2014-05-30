#!/user/bin/env bash

echo -e "\n[Start Mongodump]\n";

"$BINDIR/mongodump" --host fedev.baidu.com:8887 --db test --out $DUMPDIR -vvvvv

echo -e "\n[Mongodump Done]\n";

echo -e '\n[Start Remove user,pkgKeyword]\n';

userpath="$DUMPDIR/test/user.*";
rm -rf $userpath;

keyword="$DUMPDIR/test/pkgKeyword.*";
rm -rf $keyword;

echo -e '\n[Remove user,pkgKeyword Done]\n';

echo -e "\n[Start Mongoretore]\n";

"$BINDIR/mongorestore" --port 8887 --db test -vvvvv "$DUMPDIR/test";

echo -e "\n[Mongoretore Done]\n";
echo -e "\n[Sync Done]\n";