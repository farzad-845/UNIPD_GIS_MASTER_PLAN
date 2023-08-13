package master_plan;

import com.vividsolutions.jump.feature.FeatureCollection;
import com.vividsolutions.jump.workbench.plugin.AbstractPlugIn;
import com.vividsolutions.jump.workbench.plugin.PlugInContext;
import com.vividsolutions.jump.workbench.ui.plugin.FeatureInstaller;

import java.sql.SQLException;

public class Gap extends AbstractPlugIn {

    public Gap() throws SQLException {
    }

    @Override
    public void initialize(PlugInContext context) throws Exception {
        FeatureInstaller featureInstaller = FeatureInstaller.getInstance(context.getWorkbenchContext()); // OpenJUMP >= 2.0
        featureInstaller.addMainMenuPlugin(
                this, //exe
                new String[]{"Master Plan", "Show Data"},
                this.getName(),
                false,
                null,
                null);
    }

    @Override
    public boolean execute(PlugInContext context) throws Exception {

        Database db = new Database();

        FeatureCollection gap = db.getGapsMoreThanOne();
        context.getLayerManager().addLayer("Master Plan", "Gap", gap);

        db.close();
        return false;
    }

    @Override
    public String getName() {
        return "Get Gap More than 1";
    }
}