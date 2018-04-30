public class Toilet {

    List<Excrement> excrement;
    Pipe sewerSystemPipe;

    public Toilet(Pipe sewerPipe) {
        this.sewerSystemPipe = sewerPipe;
        this.excrement = new ArrayList<>();
    }

    void flush() {

        if (this.isClogged()) {
            System.out.println("Toilet is clogged, please use a sugekopp on me,");
        }
        else {
            System.out.println("Toilet is flushed");
            this.sewerSystemPipe.addList(excrement.empty());
        }
    }

    void addPoop(Exrement poop) {
        if (poop.isFloating()) {
            this.stinkyValue += 10;
        }

        this.excrement.add(poop);
    }

    void addPee(Exrement pee) {
        this.waterYellownessValue += pee.yellowness * 0.4;
        this.excrement.add(pee);
    }

    boolean isClogged() {
        int sum = 0;
        for (Excrement exc : this.excrement) {
            if (exc.getType().equals("poop")) {
                sum += exc.getWeight();
            }
        }

        return sum < 5000;
    }
}